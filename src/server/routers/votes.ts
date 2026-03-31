/**
 * Phase 070 & 071 — tRPC Votes Router
 *
 * Provides vote casting, changing, revoking, result queries,
 * and citizen vs. Bundestag comparison.
 */

import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { computeEventHash, getPreviousHash } from '../lib/hash-chain';
import { cache } from '@/lib/redis/cache';
import {
  castVoteSchema,
  changeVoteSchema,
  revokeVoteSchema,
  myVoteSchema,
  voteResultsSchema,
  voteComparisonSchema,
} from '@/lib/validators/vote';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Loads a topic and validates it is active with an open voting window.
 * Throws TRPCError if validation fails.
 */
async function validateTopicVotable(topicId: string): Promise<AnyRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data: topic, error } = await admin
    .from('topics')
    .select('id, status, voting_opens_at, voting_closes_at')
    .eq('id', topicId)
    .single();

  if (error || !topic) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Thema nicht gefunden.',
    });
  }

  if ((topic as AnyRow).status !== 'active') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Abstimmung ist nicht aktiv.',
    });
  }

  const now = new Date();
  const opensAt = (topic as AnyRow).voting_opens_at
    ? new Date((topic as AnyRow).voting_opens_at)
    : null;
  const closesAt = (topic as AnyRow).voting_closes_at
    ? new Date((topic as AnyRow).voting_closes_at)
    : null;

  if (opensAt && now < opensAt) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Die Abstimmung hat noch nicht begonnen.',
    });
  }

  if (closesAt && now > closesAt) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Die Abstimmung ist bereits beendet.',
    });
  }

  return topic as AnyRow;
}

/**
 * Checks that the user has given Art.9 consent (required for voting
 * since votes express political opinions).
 */
async function validateArt9Consent(userId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data, error } = await admin
    .from('user_preferences')
    .select('art9_consent_at')
    .eq('user_id', userId)
    .single();

  if (error || !data || !(data as AnyRow).art9_consent_at) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message:
        'Du musst der Verarbeitung deiner politischen Meinungsdaten (Art. 9 DSGVO) zustimmen, bevor du abstimmen kannst.',
    });
  }
}

/**
 * Finds the user's current active vote on a topic by replaying events.
 * Returns the current choice and event_hash, or null if no active vote.
 */
async function findCurrentVote(
  topicId: string,
  userId: string,
): Promise<{ choice: string; eventHash: string; votedAt: string } | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data, error } = await admin
    .from('vote_events')
    .select('event_type, payload, event_hash, created_at')
    .eq('stream_id', topicId)
    .eq('user_id', userId)
    .order('sequence_number', { ascending: true });

  if (error || !data) {
    return null;
  }

  const events = (data ?? []) as AnyRow[];

  let currentChoice: string | null = null;
  let currentHash: string | null = null;
  let currentVotedAt: string | null = null;

  for (const event of events) {
    switch (event.event_type) {
      case 'VoteCast':
        currentChoice = event.payload?.choice ?? null;
        currentHash = event.event_hash;
        currentVotedAt = event.created_at;
        break;
      case 'VoteChanged':
        currentChoice = event.payload?.new_choice ?? null;
        currentHash = event.event_hash;
        currentVotedAt = event.created_at;
        break;
      case 'VoteRevoked':
        currentChoice = null;
        currentHash = null;
        currentVotedAt = null;
        break;
    }
  }

  if (!currentChoice || !currentHash) {
    return null;
  }

  return {
    choice: currentChoice,
    eventHash: currentHash,
    votedAt: currentVotedAt!,
  };
}

// ─── Router ───────────────────────────────────────────────────────────

export const votesRouter = router({
  // ── Phase 070: Cast Vote ──────────────────────────────────────────

  /**
   * Cast a new vote on a topic.
   * Validates topic status, voting window, Art.9 consent, and uniqueness.
   */
  cast: protectedProcedure
    .input(castVoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { topicId, choice } = input;
      const userId = ctx.user.id;

      // 1. Validate topic is active and within voting window
      await validateTopicVotable(topicId);

      // 2. Validate Art.9 consent
      await validateArt9Consent(userId);

      // 3. Check no existing active vote via event replay
      const existingVote = await findCurrentVote(topicId, userId);
      if (existingVote) {
        throw new TRPCError({
          code: 'CONFLICT',
          message:
            'Du hast bereits abgestimmt. Nutze "Stimme ändern", um deine Wahl zu ändern.',
        });
      }

      // 4. Get previous hash for chain linkage
      const prevHash = await getPreviousHash(topicId);

      // 5. Build the event
      const createdAt = new Date().toISOString();
      const eventHash = await computeEventHash({
        stream_id: topicId,
        event_type: 'VoteCast',
        user_id: userId,
        payload: { choice },
        prev_hash: prevHash,
        created_at: createdAt,
      });

      // 6. Insert into vote_events (trigger will update vote_results)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const { error } = await admin.from('vote_events').insert({
        stream_id: topicId,
        event_type: 'VoteCast',
        user_id: userId,
        payload: { choice },
        prev_hash: prevHash,
        event_hash: eventHash,
        created_at: createdAt,
      });

      if (error) {
        // The unique partial index will catch genuine duplicates
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Du hast bereits abgestimmt.',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Fehler beim Speichern der Stimme: ${error.message}`,
        });
      }

      // Invalidate cached results
      await cache.del(`vote_results:${topicId}`);

      return { success: true as const, eventHash };
    }),

  // ── Phase 070: Change Vote ────────────────────────────────────────

  /**
   * Change an existing vote to a different choice.
   * Inserts a VoteChanged event (the trigger adjusts counts).
   */
  change: protectedProcedure
    .input(changeVoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { topicId, newChoice } = input;
      const userId = ctx.user.id;

      // 1. Validate topic is active and within voting window
      await validateTopicVotable(topicId);

      // 2. Find current active vote
      const currentVote = await findCurrentVote(topicId, userId);
      if (!currentVote) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Keine aktive Stimme gefunden, die geändert werden kann.',
        });
      }

      if (currentVote.choice === newChoice) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Die neue Auswahl entspricht deiner aktuellen Stimme.',
        });
      }

      // 3. Get previous hash for chain linkage
      const prevHash = await getPreviousHash(topicId);

      // 4. Build the VoteChanged event
      const createdAt = new Date().toISOString();
      const payload = {
        old_choice: currentVote.choice,
        new_choice: newChoice,
      };

      const eventHash = await computeEventHash({
        stream_id: topicId,
        event_type: 'VoteChanged',
        user_id: userId,
        payload,
        prev_hash: prevHash,
        created_at: createdAt,
      });

      // 5. Insert VoteChanged event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const { error } = await admin.from('vote_events').insert({
        stream_id: topicId,
        event_type: 'VoteChanged',
        user_id: userId,
        payload,
        prev_hash: prevHash,
        event_hash: eventHash,
        created_at: createdAt,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Fehler beim Ändern der Stimme: ${error.message}`,
        });
      }

      // Invalidate cached results
      await cache.del(`vote_results:${topicId}`);

      return { success: true as const, eventHash };
    }),

  // ── Phase 070: Revoke Vote ────────────────────────────────────────

  /**
   * Revoke (withdraw) an existing vote.
   * Inserts a VoteRevoked event (the trigger adjusts counts).
   */
  revoke: protectedProcedure
    .input(revokeVoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { topicId } = input;
      const userId = ctx.user.id;

      // 1. Validate topic is active and within voting window
      await validateTopicVotable(topicId);

      // 2. Find current active vote
      const currentVote = await findCurrentVote(topicId, userId);
      if (!currentVote) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Keine aktive Stimme gefunden, die widerrufen werden kann.',
        });
      }

      // 3. Get previous hash for chain linkage
      const prevHash = await getPreviousHash(topicId);

      // 4. Build the VoteRevoked event
      const createdAt = new Date().toISOString();
      const payload = { choice: currentVote.choice };

      const eventHash = await computeEventHash({
        stream_id: topicId,
        event_type: 'VoteRevoked',
        user_id: userId,
        payload,
        prev_hash: prevHash,
        created_at: createdAt,
      });

      // 5. Insert VoteRevoked event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const { error } = await admin.from('vote_events').insert({
        stream_id: topicId,
        event_type: 'VoteRevoked',
        user_id: userId,
        payload,
        prev_hash: prevHash,
        event_hash: eventHash,
        created_at: createdAt,
      });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Fehler beim Widerrufen der Stimme: ${error.message}`,
        });
      }

      // Invalidate cached results
      await cache.del(`vote_results:${topicId}`);

      return { success: true as const };
    }),

  // ── Phase 070: My Vote ────────────────────────────────────────────

  /**
   * Returns the user's current vote state on a topic via event replay.
   */
  myVote: protectedProcedure
    .input(myVoteSchema)
    .query(async ({ ctx, input }) => {
      const currentVote = await findCurrentVote(input.topicId, ctx.user.id);

      if (!currentVote) {
        return {
          hasVoted: false as const,
          choice: null,
          eventHash: null,
          votedAt: null,
        };
      }

      return {
        hasVoted: true as const,
        choice: currentVote.choice,
        eventHash: currentVote.eventHash,
        votedAt: currentVote.votedAt,
      };
    }),

  // ── Phase 071: Vote Results ───────────────────────────────────────

  /**
   * Returns aggregated vote results for a topic.
   * Cached in Redis with 60s TTL.
   */
  results: publicProcedure
    .input(voteResultsSchema)
    .query(async ({ input }) => {
      const { topicId } = input;
      const cacheKey = `vote_results:${topicId}`;

      // 1. Check Redis cache
      type CachedResults = {
        totalVotes: number;
        breakdown: { choice: string; count: number; percentage: number }[];
        lastUpdated: string;
      };

      const cached = await cache.get<CachedResults>(cacheKey);
      if (cached) {
        return cached;
      }

      // 2. Query vote_results table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const { data, error } = await admin
        .from('vote_results')
        .select('total_votes, results, last_updated')
        .eq('topic_id', topicId)
        .single();

      if (error || !data) {
        // No results yet — return empty
        const empty: CachedResults = {
          totalVotes: 0,
          breakdown: [],
          lastUpdated: new Date().toISOString(),
        };
        return empty;
      }

      const row = data as AnyRow;
      const totalVotes = (row.total_votes ?? 0) as number;
      const resultsJson = (row.results ?? {}) as Record<string, number>;

      // 3. Transform JSONB to typed breakdown with percentages
      const breakdown = Object.entries(resultsJson)
        .map(([choice, count]) => ({
          choice,
          count: count as number,
          percentage: totalVotes > 0 ? Math.round(((count as number) / totalVotes) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      const result: CachedResults = {
        totalVotes,
        breakdown,
        lastUpdated: row.last_updated as string,
      };

      // 4. Cache with 60s TTL
      await cache.set(cacheKey, result, 60);

      return result;
    }),

  // ── Phase 071: Citizen vs. Bundestag Comparison ───────────────────

  /**
   * Compares citizen vote results with Bundestag (parliament) votes
   * on the same topic. Includes faction breakdown and the user's
   * local MdB vote if applicable.
   */
  comparison: publicProcedure
    .input(voteComparisonSchema)
    .query(async ({ ctx, input }) => {
      const { topicId } = input;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      // 1. Get citizen vote results
      const { data: voteResultsData } = await admin
        .from('vote_results')
        .select('total_votes, results')
        .eq('topic_id', topicId)
        .single();

      const citizenResults = (voteResultsData as AnyRow)?.results ?? {};
      const citizenTotal = ((voteResultsData as AnyRow)?.total_votes ?? 0) as number;

      const citizens = {
        ja: (citizenResults.ja ?? 0) as number,
        nein: (citizenResults.nein ?? 0) as number,
        enthaltung: (citizenResults.enthaltung ?? 0) as number,
        total: citizenTotal,
      };

      // 2. Find Bundestag abstimmung linked to this topic
      const { data: abstimmungData } = await admin
        .from('bundestag_abstimmungen')
        .select('id, ergebnis')
        .eq('topic_id', topicId)
        .order('datum', { ascending: false })
        .limit(1)
        .single();

      if (!abstimmungData) {
        // No parliament vote linked — return citizen-only results
        return {
          citizens,
          bundestag: null,
          delta: null,
          factions: null,
          myMdb: null,
        };
      }

      const abstimmung = abstimmungData as AnyRow;
      const abstimmungId = abstimmung.id as string;

      // 3. Aggregate MdB votes from individual records
      const { data: mdbVotesData } = await admin
        .from('mdb_votes')
        .select('vote')
        .eq('abstimmung_id', abstimmungId);

      const mdbVotes = (mdbVotesData ?? []) as AnyRow[];

      const bundestag = {
        ja: 0,
        nein: 0,
        enthaltung: 0,
        nicht_abgegeben: 0,
        total: mdbVotes.length,
      };

      for (const mv of mdbVotes) {
        const vote = mv.vote as string;
        if (vote === 'ja') bundestag.ja += 1;
        else if (vote === 'nein') bundestag.nein += 1;
        else if (vote === 'enthaltung') bundestag.enthaltung += 1;
        else if (vote === 'nicht_abgegeben') bundestag.nicht_abgegeben += 1;
      }

      // 4. Calculate percentage deltas
      const citizenPct = (val: number) =>
        citizens.total > 0 ? (val / citizens.total) * 100 : 0;
      const btPct = (val: number) =>
        bundestag.total > 0 ? (val / bundestag.total) * 100 : 0;

      const delta = {
        ja: Math.round((citizenPct(citizens.ja) - btPct(bundestag.ja)) * 10) / 10,
        nein: Math.round((citizenPct(citizens.nein) - btPct(bundestag.nein)) * 10) / 10,
        enthaltung:
          Math.round((citizenPct(citizens.enthaltung) - btPct(bundestag.enthaltung)) * 10) / 10,
      };

      // 5. Faction breakdown: GROUP BY fraktion
      const { data: factionData } = await admin
        .from('mdb_votes')
        .select(
          `
          vote,
          bundestag_mdb!inner (
            fraktion
          )
        `,
        )
        .eq('abstimmung_id', abstimmungId);

      const factionRows = (factionData ?? []) as AnyRow[];

      const factionMap = new Map<
        string,
        { ja: number; nein: number; enthaltung: number; nicht_abgegeben: number; total: number }
      >();

      for (const row of factionRows) {
        const fraktion = (row.bundestag_mdb?.fraktion ?? 'Fraktionslos') as string;
        const vote = row.vote as string;

        if (!factionMap.has(fraktion)) {
          factionMap.set(fraktion, {
            ja: 0,
            nein: 0,
            enthaltung: 0,
            nicht_abgegeben: 0,
            total: 0,
          });
        }

        const entry = factionMap.get(fraktion)!;
        entry.total += 1;
        if (vote === 'ja') entry.ja += 1;
        else if (vote === 'nein') entry.nein += 1;
        else if (vote === 'enthaltung') entry.enthaltung += 1;
        else if (vote === 'nicht_abgegeben') entry.nicht_abgegeben += 1;
      }

      const factions = Array.from(factionMap.entries())
        .map(([fraktion, counts]) => ({
          fraktion,
          ...counts,
        }))
        .sort((a, b) => b.total - a.total);

      // 6. If user has a wahlkreis_id, find their MdB's vote
      let myMdb: { name: string; fraktion: string | null; vote: string } | null = null;

      if (ctx.profile?.wahlkreis_id) {
        const { data: mdbData } = await admin
          .from('bundestag_mdb')
          .select('id, name, fraktion')
          .eq('wahlkreis_id', ctx.profile.wahlkreis_id)
          .limit(1)
          .single();

        if (mdbData) {
          const mdb = mdbData as AnyRow;
          const { data: mdbVoteData } = await admin
            .from('mdb_votes')
            .select('vote')
            .eq('mdb_id', mdb.id)
            .eq('abstimmung_id', abstimmungId)
            .single();

          if (mdbVoteData) {
            myMdb = {
              name: mdb.name as string,
              fraktion: mdb.fraktion as string | null,
              vote: (mdbVoteData as AnyRow).vote as string,
            };
          }
        }
      }

      return {
        citizens,
        bundestag,
        delta,
        factions,
        myMdb,
      };
    }),
});
