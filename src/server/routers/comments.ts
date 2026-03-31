/**
 * Phasen 127–130 — tRPC Comments Router
 *
 * Endpunkte fuer Kommentare: Auflisten, Erstellen, Bearbeiten,
 * Bewerten und Melden.
 */

import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import { awardPoints } from '@/server/services/points.service';
import { requireTier } from '@/server/middleware/requireTier';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Strips HTML tags from content for basic sanitization.
 */
function sanitizeContent(raw: string): string {
  return raw.replace(/<[^>]*>/g, '').trim();
}

/**
 * Maps a sort key to Supabase order clauses.
 * Returns an array of { column, ascending } objects.
 */
function getSortClauses(sort: string): { column: string; ascending: boolean; nullsFirst?: boolean }[] {
  switch (sort) {
    case 'newest':
      return [{ column: 'created_at', ascending: false }];
    case 'oldest':
      return [{ column: 'created_at', ascending: true }];
    case 'most_votes':
      return [
        { column: 'net_votes', ascending: false },
        { column: 'created_at', ascending: false },
      ];
    case 'bridging':
    default:
      return [
        { column: 'bridging_score', ascending: false, nullsFirst: false },
        { column: 'created_at', ascending: false },
      ];
  }
}

/**
 * Transforms a raw database row + author data into a CommentItem shape.
 */
function toCommentItem(
  row: AnyRow,
  userRating: 'up' | 'down' | null,
  replyCount: number,
): {
  id: string;
  topicId: string;
  parentId: string | null;
  content: string;
  position: 'pro' | 'contra' | 'neutral';
  sources: string[];
  upvotes: number;
  downvotes: number;
  bridgingScore: number | null;
  replyCount: number;
  createdAt: string;
  updatedAt: string | null;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    privilegeTier: number;
  };
  userRating: 'up' | 'down' | null;
  isFlagged: boolean;
} {
  return {
    id: row.id as string,
    topicId: row.topic_id as string,
    parentId: (row.parent_id ?? null) as string | null,
    content: row.content as string,
    position: row.position as 'pro' | 'contra' | 'neutral',
    sources: (row.sources ?? []) as string[],
    upvotes: (row.upvotes ?? 0) as number,
    downvotes: (row.downvotes ?? 0) as number,
    bridgingScore: (row.bridging_score ?? null) as number | null,
    replyCount,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at ?? null) as string | null,
    author: {
      id: row.user_id as string,
      displayName: (row.profiles?.display_name ?? 'Unbekannt') as string,
      avatarUrl: (row.profiles?.avatar_url ?? null) as string | null,
      privilegeTier: (row.profiles?.privilege_tier ?? 1) as number,
    },
    userRating,
    isFlagged: (row.is_flagged ?? false) as boolean,
  };
}

// ─── Router ───────────────────────────────────────────────────────────

export const commentsRouter = router({
  // ── Phase 127: List Comments ──────────────────────────────────────

  /**
   * Listet Kommentare zu einem Thema auf.
   * Oeffentlich zugaenglich. Unterstuetzt Sortierung, Filter, Cursor-Pagination
   * und 2-Ebenen-Verschachtelung.
   */
  list: publicProcedure
    .input(
      z.object({
        topicId: z.uuid(),
        sort: z.enum(['bridging', 'newest', 'oldest', 'most_votes']).default('bridging'),
        filter: z.enum(['all', 'pro', 'contra', 'neutral']).default('all'),
        parentId: z.string().uuid().nullable().default(null),
        cursor: z.string().nullable().default(null),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { topicId, sort, filter, parentId, cursor, limit } = input;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      // Build base query with profile join
      let query = admin
        .from('comments')
        .select(
          `
          id, topic_id, parent_id, user_id, content, position, sources,
          upvotes, downvotes, bridging_score, is_flagged,
          created_at, updated_at,
          profiles!comments_user_id_fkey (
            display_name, avatar_url, privilege_tier
          )
        `,
        )
        .eq('topic_id', topicId);

      // Parent filter: top-level or replies
      if (parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', parentId);
      }

      // Position filter
      if (filter !== 'all') {
        query = query.eq('position', filter);
      }

      // Cursor pagination
      if (cursor) {
        // For 'oldest' sort (ascending), we fetch after the cursor
        if (sort === 'oldest') {
          query = query.gt('created_at', cursor);
        } else {
          query = query.lt('created_at', cursor);
        }
      }

      // Apply sort order
      // For 'most_votes' we need a computed column workaround —
      // Supabase doesn't support ordering by expression directly,
      // so we use net_votes if it exists, otherwise fall back to upvotes
      const sortClauses = getSortClauses(sort);
      for (const clause of sortClauses) {
        if (clause.column === 'net_votes') {
          // Fall back: order by upvotes DESC as approximation,
          // then adjust in application layer if needed
          query = query.order('upvotes', { ascending: clause.ascending });
        } else {
          query = query.order(clause.column, {
            ascending: clause.ascending,
            ...(clause.nullsFirst !== undefined ? { nullsFirst: clause.nullsFirst } : {}),
          });
        }
      }

      // Fetch limit + 1 for cursor detection
      query = query.limit(limit + 1);

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Kommentare konnten nicht geladen werden: ${error.message}`,
        });
      }

      const rows = (data ?? []) as AnyRow[];
      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;

      // Get reply counts for top-level comments
      let replyCountMap = new Map<string, number>();
      if (parentId === null && items.length > 0) {
        const commentIds = items.map((r: AnyRow) => r.id as string);

        const { data: replyCounts } = await admin
          .from('comments')
          .select('parent_id')
          .in('parent_id', commentIds);

        if (replyCounts) {
          for (const rc of replyCounts as AnyRow[]) {
            const pid = rc.parent_id as string;
            replyCountMap.set(pid, (replyCountMap.get(pid) ?? 0) + 1);
          }
        }
      }

      // Get user ratings if authenticated
      let userRatingMap = new Map<string, 'up' | 'down'>();
      if (ctx.user && items.length > 0) {
        const commentIds = items.map((r: AnyRow) => r.id as string);

        const { data: ratings } = await admin
          .from('comment_ratings')
          .select('comment_id, rating')
          .eq('user_id', ctx.user.id)
          .in('comment_id', commentIds);

        if (ratings) {
          for (const r of ratings as AnyRow[]) {
            userRatingMap.set(r.comment_id as string, r.rating as 'up' | 'down');
          }
        }
      }

      // Build response items
      const commentItems = items.map((row: AnyRow) =>
        toCommentItem(
          row,
          userRatingMap.get(row.id as string) ?? null,
          replyCountMap.get(row.id as string) ?? 0,
        ),
      );

      const nextCursor = hasMore
        ? (items[items.length - 1].created_at as string)
        : null;

      return {
        items: commentItems,
        nextCursor,
      };
    }),

  // ── Phase 128: Create Comment ─────────────────────────────────────

  /**
   * Erstellt einen neuen Kommentar zu einem Thema.
   * Unterstuetzt Top-Level und Antworten (max. 2 Ebenen).
   */
  create: protectedProcedure
    .input(
      z.object({
        topicId: z.uuid(),
        content: z.string().min(1).max(2000),
        position: z.enum(['pro', 'contra', 'neutral']),
        sources: z
          .array(z.string().url().max(500))
          .max(5)
          .default([]),
        parentId: z.string().uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { topicId, content, position, sources, parentId } = input;
      const userId = ctx.user.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      // 1. Validate topic exists and is in active/voting status
      const { data: topic, error: topicError } = await admin
        .from('topics')
        .select('id, status')
        .eq('id', topicId)
        .single();

      if (topicError || !topic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thema nicht gefunden.',
        });
      }

      const topicStatus = (topic as AnyRow).status as string;
      if (topicStatus !== 'active' && topicStatus !== 'voting') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Kommentare können nur bei aktiven oder in Abstimmung befindlichen Themen erstellt werden.',
        });
      }

      // 2. Validate parent if provided
      if (parentId) {
        const { data: parent, error: parentError } = await admin
          .from('comments')
          .select('id, parent_id')
          .eq('id', parentId)
          .single();

        if (parentError || !parent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Elternkommentar nicht gefunden.',
          });
        }

        // Max 2 levels: parent must be top-level
        if ((parent as AnyRow).parent_id !== null) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Antworten sind nur auf Top-Level-Kommentare möglich (maximal 2 Ebenen).',
          });
        }
      }

      // 3. Sanitize content
      const sanitized = sanitizeContent(content);
      if (sanitized.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Kommentarinhalt darf nicht leer sein.',
        });
      }

      // 4. Insert comment
      const { data: comment, error: insertError } = await admin
        .from('comments')
        .insert({
          topic_id: topicId,
          user_id: userId,
          parent_id: parentId ?? null,
          content: sanitized,
          position,
          sources,
          upvotes: 0,
          downvotes: 0,
          bridging_score: null,
          is_flagged: false,
          created_at: new Date().toISOString(),
        })
        .select(
          `
          id, topic_id, parent_id, user_id, content, position, sources,
          upvotes, downvotes, bridging_score, is_flagged,
          created_at, updated_at
        `,
        )
        .single();

      if (insertError || !comment) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Kommentar konnte nicht erstellt werden: ${insertError?.message ?? 'Unbekannter Fehler'}`,
        });
      }

      // 5. Increment comment_count on topic
      await admin.rpc('increment_comment_count', { p_topic_id: topicId }).catch(async () => {
        // Fallback: manual increment
        const { data: currentTopic } = await admin
          .from('topics')
          .select('comment_count')
          .eq('id', topicId)
          .single();

        const currentCount = ((currentTopic as AnyRow)?.comment_count ?? 0) as number;
        await admin
          .from('topics')
          .update({ comment_count: currentCount + 1 })
          .eq('id', topicId);
      });

      // 6. Award points
      const commentRow = comment as AnyRow;
      await awardPoints(userId, 'COMMENT_CREATE', commentRow.id as string);

      // 7. Invalidate cache
      await cache.del(`comments:topic:${topicId}`);

      // 8. Build response with author info from context
      return {
        id: commentRow.id as string,
        topicId: commentRow.topic_id as string,
        parentId: (commentRow.parent_id ?? null) as string | null,
        content: commentRow.content as string,
        position: commentRow.position as 'pro' | 'contra' | 'neutral',
        sources: (commentRow.sources ?? []) as string[],
        upvotes: 0,
        downvotes: 0,
        bridgingScore: null as number | null,
        replyCount: 0,
        createdAt: commentRow.created_at as string,
        updatedAt: (commentRow.updated_at ?? null) as string | null,
        author: {
          id: userId,
          displayName: (ctx.profile?.display_name ?? 'Unbekannt') as string,
          avatarUrl: (ctx.profile?.avatar_url ?? null) as string | null,
          privilegeTier: (ctx.profile?.privilege_tier ?? 1) as number,
        },
        userRating: null as 'up' | 'down' | null,
        isFlagged: false,
      };
    }),

  // ── Phase 128: Update Comment ─────────────────────────────────────

  /**
   * Aktualisiert den Inhalt eines eigenen Kommentars.
   * Nur innerhalb von 15 Minuten nach Erstellung moeglich.
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        content: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, content } = input;
      const userId = ctx.user.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      // 1. Fetch the comment
      const { data: comment, error } = await admin
        .from('comments')
        .select('id, user_id, created_at')
        .eq('id', id)
        .single();

      if (error || !comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kommentar nicht gefunden.',
        });
      }

      const commentRow = comment as AnyRow;

      // 2. Ownership check
      if (commentRow.user_id !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Du kannst nur eigene Kommentare bearbeiten.',
        });
      }

      // 3. 15-minute edit window
      const createdAt = new Date(commentRow.created_at as string);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      if (diffMinutes > 15) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Kommentare können nur innerhalb von 15 Minuten nach Erstellung bearbeitet werden.',
        });
      }

      // 4. Sanitize
      const sanitized = sanitizeContent(content);
      if (sanitized.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Kommentarinhalt darf nicht leer sein.',
        });
      }

      // 5. Update
      const { error: updateError } = await admin
        .from('comments')
        .update({
          content: sanitized,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Kommentar konnte nicht aktualisiert werden: ${updateError.message}`,
        });
      }

      return { success: true as const };
    }),

  // ── Phase 129: Rate Comment ───────────────────────────────────────

  /**
   * Bewertet einen Kommentar (up/down). Toggle-Logik:
   * gleiche Bewertung erneut → entfernen, andere → aendern.
   */
  rate: protectedProcedure
    .input(
      z.object({
        commentId: z.uuid(),
        rating: z.enum(['up', 'down']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId, rating } = input;
      const userId = ctx.user.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      // 1. Fetch the comment
      const { data: comment, error: commentError } = await admin
        .from('comments')
        .select('id, user_id, topic_id, upvotes, downvotes')
        .eq('id', commentId)
        .single();

      if (commentError || !comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kommentar nicht gefunden.',
        });
      }

      const commentRow = comment as AnyRow;

      // 2. No self-rating
      if (commentRow.user_id === userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Eigene Kommentare können nicht bewertet werden.',
        });
      }

      const topicId = commentRow.topic_id as string;

      // 3. Look up user's current vote position on the topic
      const { data: voteEvent } = await admin
        .from('vote_events')
        .select('payload')
        .eq('stream_id', topicId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let voterPosition: string | null = null;
      if (voteEvent) {
        const payload = (voteEvent as AnyRow).payload;
        // VoteCast → payload.choice, VoteChanged → payload.new_choice, VoteRevoked → null
        if (payload?.new_choice) {
          voterPosition = payload.new_choice as string;
        } else if (payload?.choice) {
          voterPosition = payload.choice as string;
        }
      }

      // 4. Check existing rating
      const { data: existing } = await admin
        .from('comment_ratings')
        .select('id, rating')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();

      let newUpvotes = (commentRow.upvotes ?? 0) as number;
      let newDownvotes = (commentRow.downvotes ?? 0) as number;
      let resultRating: 'up' | 'down' | null;

      if (existing) {
        const existingRating = (existing as AnyRow).rating as string;

        if (existingRating === rating) {
          // Same rating → toggle off (remove)
          await admin
            .from('comment_ratings')
            .delete()
            .eq('id', (existing as AnyRow).id);

          if (rating === 'up') {
            newUpvotes = Math.max(0, newUpvotes - 1);
          } else {
            newDownvotes = Math.max(0, newDownvotes - 1);
          }
          resultRating = null;
        } else {
          // Different rating → update
          await admin
            .from('comment_ratings')
            .update({
              rating,
              voter_position: voterPosition,
            })
            .eq('id', (existing as AnyRow).id);

          // Remove old, add new
          if (existingRating === 'up') {
            newUpvotes = Math.max(0, newUpvotes - 1);
            newDownvotes += 1;
          } else {
            newDownvotes = Math.max(0, newDownvotes - 1);
            newUpvotes += 1;
          }
          resultRating = rating;
        }
      } else {
        // No existing rating → insert
        await admin.from('comment_ratings').insert({
          comment_id: commentId,
          user_id: userId,
          rating,
          voter_position: voterPosition,
        });

        if (rating === 'up') {
          newUpvotes += 1;
        } else {
          newDownvotes += 1;
        }
        resultRating = rating;
      }

      // 5. Update counters on comment row
      const { error: updateError } = await admin
        .from('comments')
        .update({
          upvotes: newUpvotes,
          downvotes: newDownvotes,
        })
        .eq('id', commentId);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Bewertung konnte nicht gespeichert werden: ${updateError.message}`,
        });
      }

      // 6. Award points (idempotency handled by awardPoints)
      await awardPoints(userId, 'COMMENT_RATE', `${commentId}:${rating}`);

      return {
        rating: resultRating,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      };
    }),

  // ── Phase 130: Report Comment ─────────────────────────────────────

  /**
   * Meldet einen Kommentar. Erfordert mindestens Privilegstufe 1.
   * Bei >= 3 Meldungen wird der Kommentar als markiert gesetzt.
   */
  report: protectedProcedure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .use(requireTier(1) as any)
    .input(
      z.object({
        commentId: z.uuid(),
        reason: z.enum([
          'spam',
          'hate_speech',
          'misinformation',
          'harassment',
          'off_topic',
          'other',
        ]),
        details: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { commentId, reason, details } = input;
      const userId = ctx.user.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      // 1. Verify comment exists
      const { data: comment, error: commentError } = await admin
        .from('comments')
        .select('id')
        .eq('id', commentId)
        .single();

      if (commentError || !comment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Kommentar nicht gefunden.',
        });
      }

      // 2. Check for duplicate report
      const { data: existingReport } = await admin
        .from('reports')
        .select('id')
        .eq('reporter_id', userId)
        .eq('content_type', 'comment')
        .eq('content_id', commentId)
        .limit(1);

      if (existingReport && existingReport.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Du hast diesen Kommentar bereits gemeldet.',
        });
      }

      // 3. Insert report
      const { error: insertError } = await admin.from('reports').insert({
        reporter_id: userId,
        content_type: 'comment',
        content_id: commentId,
        reason,
        details: details ?? null,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Meldung konnte nicht erstellt werden: ${insertError.message}`,
        });
      }

      // 4. Count total reports for this comment
      const { count, error: countError } = await admin
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('content_type', 'comment')
        .eq('content_id', commentId);

      if (!countError && count !== null && count >= 3) {
        // Flag the comment
        await admin
          .from('comments')
          .update({ is_flagged: true })
          .eq('id', commentId);
      }

      return { reported: true as const };
    }),
});
