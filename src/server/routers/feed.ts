/**
 * Phase 145 -- Feed tRPC Router
 *
 * Home-Feed mit Personalisierung, Trending, Lesezeichen.
 */

import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { scoreFeedTopics } from '@/server/lib/feed/score';
import type { FeedTopic, UserFeedPrefs, ScoredTopic } from '@/server/lib/feed/score';
import { enforceRatio } from '@/server/lib/feed/ratio-enforcer';
import { feedCache } from '@/server/lib/feed/cache';
import { FEED_PAGE_SIZE, TRENDING_COUNT } from '@/server/lib/feed/constants';
import { isSitzungswocheActive } from '@/server/services/sitzungswoche.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ─── Types ──────────────────────────────────────────────────────────

interface FeedResult {
  topics: FeedTopic[];
  nextCursor: number | null;
}

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Mappt eine Datenbankzeile auf ein FeedTopic.
 */
function mapRowToFeedTopic(row: AnyRow): FeedTopic {
  return {
    id: row.id,
    title: row.title ?? '',
    source: row.source ?? 'BUNDESTAG',
    category: row.category ?? '',
    status: row.status ?? 'active',
    vote_count: row.vote_count ?? 0,
    comment_count: row.comment_count ?? 0,
    closes_at: row.closes_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    wahlkreis_id: row.wahlkreis_id ?? null,
    recent_votes_24h: 0,
    recent_comments_24h: 0,
  };
}

// ─── Router ─────────────────────────────────────────────────────────

export const feedRouter = router({
  // ── Home Feed (auth optional, personalisiert wenn eingeloggt) ──

  home: publicProcedure
    .input(
      z.object({
        cursor: z.number().int().min(0).optional(),
        source: z.enum(['BUNDESTAG', 'BUERGER', 'all']).optional(),
        category: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cursor = input.cursor ?? 0;
      const source = input.source;
      const category = input.category;
      const userId = ctx.user?.id ?? null;
      const pageSize = FEED_PAGE_SIZE;

      // ── Cache pruefen ──
      const isFiltered = (source && source !== 'all') || category;

      if (!isFiltered) {
        if (userId) {
          const cached = await feedCache.getPersonalFeed<FeedResult>(
            userId,
            cursor,
          );
          if (cached) return cached;
        } else {
          const cached = await feedCache.getAnonymousFeed<FeedResult>(cursor);
          if (cached) return cached;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      // ── Themen laden ──
      let query = admin
        .from('topics')
        .select('*')
        .in('status', ['voting', 'active', 'pending'])
        .order('updated_at', { ascending: false })
        .limit(100);

      if (source && source !== 'all') {
        query = query.eq('source', source);
      }
      if (category) {
        query = query.eq('category', category);
      }

      const { data: topicRows, error: topicError } = await query;

      if (topicError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Fehler beim Laden des Feeds: ${topicError.message}`,
        });
      }

      const rows = (topicRows ?? []) as AnyRow[];

      // ── Aktivitaet der letzten 24h fuer Engagement-Geschwindigkeit ──
      const twentyFourHoursAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();

      const topicIds = rows.map((r: AnyRow) => r.id as string);
      const recentVotesMap: Record<string, number> = {};
      const recentCommentsMap: Record<string, number> = {};

      if (topicIds.length > 0) {
        // Stimmen der letzten 24h
        const { data: recentVotes } = await admin
          .from('vote_events')
          .select('topic_id')
          .in('topic_id', topicIds)
          .gte('created_at', twentyFourHoursAgo);

        if (recentVotes) {
          for (const rv of recentVotes as AnyRow[]) {
            const tid = rv.topic_id as string;
            recentVotesMap[tid] = (recentVotesMap[tid] ?? 0) + 1;
          }
        }

        // Kommentare der letzten 24h
        const { data: recentComments } = await admin
          .from('comments')
          .select('topic_id')
          .in('topic_id', topicIds)
          .gte('created_at', twentyFourHoursAgo);

        if (recentComments) {
          for (const rc of recentComments as AnyRow[]) {
            const tid = rc.topic_id as string;
            recentCommentsMap[tid] = (recentCommentsMap[tid] ?? 0) + 1;
          }
        }
      }

      // ── Nutzerpraeferenzen laden ──
      let userPrefs: UserFeedPrefs | undefined;

      if (userId) {
        const { data: profile } = await admin
          .from('profiles')
          .select('preferred_categories, wahlkreis_id')
          .eq('id', userId)
          .single();

        if (profile) {
          userPrefs = {
            categories: (profile as AnyRow).preferred_categories ?? [],
            wahlkreis_id: (profile as AnyRow).wahlkreis_id ?? null,
          };
        }
      }

      // ── Sitzungswoche pruefen ──
      const sitzungswoche = await isSitzungswocheActive();

      // ── Themen zu FeedTopics mappen und 24h-Aktivitaet anreichern ──
      const feedTopics: FeedTopic[] = rows.map((row: AnyRow) => {
        const ft = mapRowToFeedTopic(row);
        ft.recent_votes_24h = recentVotesMap[row.id] ?? 0;
        ft.recent_comments_24h = recentCommentsMap[row.id] ?? 0;
        return ft;
      });

      // ── Scoring mit scoreFeedTopics ──
      const scoredTopics = scoreFeedTopics(feedTopics, userPrefs, sitzungswoche);

      // ── Ratio Enforcement (nur ohne Quell-Filter) ──
      let orderedTopics: ScoredTopic[];
      if (source && source !== 'all') {
        orderedTopics = scoredTopics;
      } else {
        orderedTopics = enforceRatio(scoredTopics, scoredTopics.length);
      }

      // ── Paginierung (cursor = Offset) ──
      const startIdx = cursor * pageSize;
      const pageTopics = orderedTopics.slice(startIdx, startIdx + pageSize);
      const nextCursor =
        startIdx + pageSize < orderedTopics.length ? cursor + 1 : null;

      const result: FeedResult = {
        topics: pageTopics,
        nextCursor,
      };

      // ── Ergebnis cachen (nur fuer ungefilterte Feeds) ──
      if (!isFiltered) {
        if (userId) {
          await feedCache.setPersonalFeed(userId, cursor, result);
        } else {
          await feedCache.setAnonymousFeed(cursor, result);
        }
      }

      return result;
    }),

  // ── Trending (Top 5 nach Engagement-Geschwindigkeit) ──────────

  trending: publicProcedure.query(async () => {
    // ── Cache pruefen ──
    const cached = await feedCache.getTrending<FeedResult>();
    if (cached) return cached;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;

    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    // Stimmen der letzten 24h zaehlen
    const { data: recentVotes, error: voteError } = await admin
      .from('vote_events')
      .select('topic_id')
      .gte('created_at', twentyFourHoursAgo);

    if (voteError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Fehler beim Laden der Trends: ${voteError.message}`,
      });
    }

    // Kommentare der letzten 24h zaehlen
    const { data: recentComments } = await admin
      .from('comments')
      .select('topic_id')
      .gte('created_at', twentyFourHoursAgo);

    // Engagement pro Thema summieren (Stimmen + Kommentare)
    const engagementMap: Record<string, number> = {};

    for (const rv of (recentVotes ?? []) as AnyRow[]) {
      const tid = rv.topic_id as string;
      engagementMap[tid] = (engagementMap[tid] ?? 0) + 1;
    }
    for (const rc of (recentComments ?? []) as AnyRow[]) {
      const tid = rc.topic_id as string;
      engagementMap[tid] = (engagementMap[tid] ?? 0) + 1;
    }

    // Top N nach Engagement sortieren
    const topTopicIds = Object.entries(engagementMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TRENDING_COUNT * 2)
      .map(([id]) => id);

    if (topTopicIds.length === 0) {
      const emptyResult: FeedResult = { topics: [], nextCursor: null };
      await feedCache.setTrending(emptyResult);
      return emptyResult;
    }

    // Themen-Details laden
    const { data: topicRows, error: topicError } = await admin
      .from('topics')
      .select('*')
      .in('id', topTopicIds)
      .in('status', ['active', 'voting', 'pending']);

    if (topicError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Fehler beim Laden der Trending-Themen: ${topicError.message}`,
      });
    }

    const rows = (topicRows ?? []) as AnyRow[];

    // Mappen und nach Engagement sortieren, auf TRENDING_COUNT begrenzen
    const topics: FeedTopic[] = rows
      .map((row: AnyRow) => {
        const ft = mapRowToFeedTopic(row);
        ft.recent_votes_24h = engagementMap[row.id] ?? 0;
        return ft;
      })
      .sort((a, b) => (b.recent_votes_24h ?? 0) - (a.recent_votes_24h ?? 0))
      .slice(0, TRENDING_COUNT);

    const result: FeedResult = { topics, nextCursor: null };
    await feedCache.setTrending(result);

    return result;
  }),

  // ── Lesezeichen setzen ─────────────────────────────────────────

  bookmark: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const { error } = await admin.from('bookmarks').upsert(
        {
          user_id: userId,
          topic_id: input.topicId,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,topic_id' },
      );

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Lesezeichen konnte nicht gesetzt werden: ${error.message}`,
        });
      }

      await feedCache.invalidateForUser(userId);

      return { bookmarked: true as const };
    }),

  // ── Lesezeichen entfernen ──────────────────────────────────────

  removeBookmark: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const { error } = await admin
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('topic_id', input.topicId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Lesezeichen konnte nicht entfernt werden: ${error.message}`,
        });
      }

      await feedCache.invalidateForUser(userId);

      return { bookmarked: false as const };
    }),

  // ── Lesezeichen auflisten ─────────────────────────────────────

  bookmarks: protectedProcedure
    .input(
      z.object({
        cursor: z.number().int().min(0).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const cursor = input.cursor ?? 0;
      const pageSize = FEED_PAGE_SIZE;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const offset = cursor * pageSize;

      const { data, error } = await admin
        .from('bookmarks')
        .select(
          `
          created_at,
          topic:topics (
            id,
            title,
            source,
            category,
            status,
            vote_count,
            comment_count,
            closes_at,
            created_at,
            updated_at,
            wahlkreis_id
          )
        `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Fehler beim Laden der Lesezeichen: ${error.message}`,
        });
      }

      const rows = (data ?? []) as AnyRow[];
      const hasMore = rows.length > pageSize;
      const bookmarkRows = hasMore ? rows.slice(0, pageSize) : rows;

      const topics: FeedTopic[] = bookmarkRows
        .filter((row: AnyRow) => row.topic !== null)
        .map((row: AnyRow) => {
          const topic = row.topic;
          return {
            id: topic.id,
            title: topic.title ?? '',
            source: topic.source ?? 'BUNDESTAG',
            category: topic.category ?? '',
            status: topic.status ?? 'active',
            vote_count: topic.vote_count ?? 0,
            comment_count: topic.comment_count ?? 0,
            closes_at: topic.closes_at ?? null,
            created_at: topic.created_at,
            updated_at: topic.updated_at ?? topic.created_at,
            wahlkreis_id: topic.wahlkreis_id ?? null,
          } satisfies FeedTopic;
        });

      const nextCursor = hasMore ? cursor + 1 : null;

      return { topics, nextCursor };
    }),

  // ── Lesezeichen-Status pruefen ─────────────────────────────────

  isBookmarked: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const { data, error } = await admin
        .from('bookmarks')
        .select('topic_id')
        .eq('user_id', userId)
        .eq('topic_id', input.topicId)
        .limit(1);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Fehler beim Prüfen des Lesezeichens: ${error.message}`,
        });
      }

      return { bookmarked: (data?.length ?? 0) > 0 };
    }),
});
