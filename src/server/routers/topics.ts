/**
 * Phase 125 & 126 -- tRPC Topics Router
 *
 * CRUD-Operationen, Support/Unsupport, Publish, Close fuer Buerger-Themen.
 */

import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import { awardPoints } from '@/server/services/points.service';
import { requireTier } from '@/server/middleware/requireTier';
import { CATEGORY_IDS } from '@/lib/constants/categories';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ─── Shared Schemas ──────────────────────────────────────────────────

const categorySchema = z.enum(CATEGORY_IDS);

const votingFormatSchema = z.enum(['yes_no_abstain', 'multiple_choice']);

const durationSchema = z.union([z.literal(7), z.literal(14), z.literal(30)]);

const topicStatusSchema = z.enum([
  'draft',
  'pending',
  'active',
  'voting',
  'closed',
  'archived',
]);

const sourceSchema = z.enum(['BUNDESTAG', 'BUERGER']);

const sortSchema = z.enum(['newest', 'popular', 'closing_soon']);

// ─── Helpers ─────────────────────────────────────────────────────────

/** Returns CET "YYYY-MM-DD" for start-of-month queries. */
function cetMonthStart(): string {
  const now = new Date();
  const cetDate = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
  return cetDate.slice(0, 7) + '-01'; // "2026-03-01"
}

// ─── Router ──────────────────────────────────────────────────────────

export const topicsRouter = router({
  // ── Phase 125: Create ────────────────────────────────────────────

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(200),
        description: z.string().min(10).max(5000),
        category: categorySchema,
        tags: z.array(z.string().max(30)).max(5),
        votingFormat: votingFormatSchema,
        duration: durationSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      // --- Free-tier limit: max 5 topics / month for tier 0 ---
      const userTier = (ctx.profile?.privilege_tier ?? 0) as number;

      if (userTier === 0) {
        const monthStart = cetMonthStart();

        const { count, error: countError } = await admin
          .from('topics')
          .select('id', { count: 'exact', head: true })
          .eq('created_by', userId)
          .gte('created_at', monthStart);

        if (countError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Fehler beim Prüfen des Monatslimits.',
          });
        }

        if ((count ?? 0) >= 5) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'Limit erreicht: Maximal 5 Themen pro Monat auf dieser Stufe.',
          });
        }
      }

      // --- Insert topic ---
      const { data: topic, error: insertError } = await admin
        .from('topics')
        .insert({
          title: input.title,
          description: input.description,
          category: input.category,
          tags: input.tags,
          voting_format: input.votingFormat,
          duration: input.duration,
          status: 'draft',
          source: 'BUERGER',
          created_by: userId,
          closes_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError || !topic) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Thema konnte nicht erstellt werden: ${insertError?.message ?? 'Unbekannter Fehler'}`,
        });
      }

      // --- Award points ---
      await awardPoints(userId, 'TOPIC_CREATE', (topic as AnyRow).id);

      // --- Invalidate cache ---
      await cache.del(`topics:user:${userId}:count`);

      return { id: (topic as AnyRow).id as string };
    }),

  // ── Phase 125: Update ────────────────────────────────────────────

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(3).max(200).optional(),
        description: z.string().min(10).max(5000).optional(),
        category: categorySchema.optional(),
        tags: z.array(z.string().max(30)).max(5).optional(),
        votingFormat: votingFormatSchema.optional(),
        duration: durationSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      // --- Fetch topic & authorize ---
      const { data: topic, error: fetchError } = await admin
        .from('topics')
        .select('id, status, created_by')
        .eq('id', input.id)
        .single();

      if (fetchError || !topic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thema nicht gefunden.',
        });
      }

      if ((topic as AnyRow).created_by !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Du kannst nur eigene Themen bearbeiten.',
        });
      }

      if ((topic as AnyRow).status !== 'draft') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Nur Entwürfe können bearbeitet werden.',
        });
      }

      // --- Build update payload ---
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (input.title !== undefined) updates.title = input.title;
      if (input.description !== undefined) updates.description = input.description;
      if (input.category !== undefined) updates.category = input.category;
      if (input.tags !== undefined) updates.tags = input.tags;
      if (input.votingFormat !== undefined) updates.voting_format = input.votingFormat;
      if (input.duration !== undefined) updates.duration = input.duration;

      const { error: updateError } = await admin
        .from('topics')
        .update(updates)
        .eq('id', input.id);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Thema konnte nicht aktualisiert werden: ${updateError.message}`,
        });
      }

      return { success: true as const };
    }),

  // ── Phase 125: Get By ID ─────────────────────────────────────────

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const cacheKey = `topic:${input.id}`;

      const cached = await cache.get<AnyRow>(cacheKey);
      if (cached) return cached;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const { data: topic, error } = await admin
        .from('topics')
        .select(
          `
          *,
          creator:profiles!created_by (
            display_name,
            avatar_url
          )
        `,
        )
        .eq('id', input.id)
        .single();

      if (error || !topic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thema nicht gefunden.',
        });
      }

      // Supporter count
      const { count: supporterCount } = await admin
        .from('topic_supporters')
        .select('id', { count: 'exact', head: true })
        .eq('topic_id', input.id);

      // Comment count
      const { count: commentCount } = await admin
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('topic_id', input.id);

      // Vote count
      const { count: voteCount } = await admin
        .from('vote_results')
        .select('total_votes')
        .eq('topic_id', input.id)
        .single()
        .then((res: AnyRow) => ({ count: (res.data as AnyRow)?.total_votes ?? 0 }));

      const result = {
        ...(topic as AnyRow),
        supporter_count: supporterCount ?? 0,
        comment_count: commentCount ?? 0,
        vote_count: voteCount ?? 0,
      };

      await cache.set(cacheKey, result, 60);

      return result;
    }),

  // ── Phase 125: List ──────────────────────────────────────────────

  list: publicProcedure
    .input(
      z.object({
        status: topicStatusSchema.optional(),
        category: z.string().optional(),
        source: sourceSchema.optional(),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
        sort: sortSchema.default('newest'),
      }),
    )
    .query(async ({ input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const { status, category, source, cursor, limit, sort } = input;

      // Determine sort column and direction
      let orderColumn = 'created_at';
      let ascending = false;

      if (sort === 'popular') {
        orderColumn = 'supporter_count';
        ascending = false;
      } else if (sort === 'closing_soon') {
        orderColumn = 'closes_at';
        ascending = true;
      }

      let query = admin
        .from('topics')
        .select(
          `
          *,
          creator:profiles!created_by (
            display_name,
            avatar_url
          )
        `,
        )
        .order(orderColumn, { ascending });

      // Filters
      if (status) query = query.eq('status', status);
      if (category) query = query.eq('category', category);
      if (source) query = query.eq('source', source);

      // Closing soon: only topics that actually have a closes_at
      if (sort === 'closing_soon') {
        query = query.not('closes_at', 'is', null);
      }

      // Cursor-based pagination
      if (cursor) {
        if (sort === 'popular') {
          // cursor = "count|id"
          const parts = cursor.split('|');
          const countVal = parseInt(parts[0] ?? '0', 10);
          const cursorId = parts[1] ?? '';
          query = query.or(
            `supporter_count.lt.${countVal},and(supporter_count.eq.${countVal},id.lt.${cursorId})`,
          );
        } else if (sort === 'closing_soon') {
          // cursor = "closes_at|id"
          const parts = cursor.split('|');
          const closesAt = parts[0] ?? '';
          const cursorId = parts[1] ?? '';
          query = query.or(
            `closes_at.gt.${closesAt},and(closes_at.eq.${closesAt},id.gt.${cursorId})`,
          );
        } else {
          // newest: cursor = "created_at|id"
          const parts = cursor.split('|');
          const createdAt = parts[0] ?? '';
          const cursorId = parts[1] ?? '';
          query = query.or(
            `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${cursorId})`,
          );
        }
      }

      // Fetch one extra to determine if there is a next page
      query = query.limit(limit + 1);

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Fehler beim Laden der Themen: ${error.message}`,
        });
      }

      const rows = (data ?? []) as AnyRow[];
      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;

      let nextCursor: string | null = null;

      if (hasMore && items.length > 0) {
        const last = items[items.length - 1];
        if (sort === 'popular') {
          nextCursor = `${last.supporter_count}|${last.id}`;
        } else if (sort === 'closing_soon') {
          nextCursor = `${last.closes_at}|${last.id}`;
        } else {
          nextCursor = `${last.created_at}|${last.id}`;
        }
      }

      return { items, nextCursor };
    }),

  // ── Phase 125: My Topics ─────────────────────────────────────────

  myTopics: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      let query = admin
        .from('topics')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (input.cursor) {
        const [createdAt, cursorId] = input.cursor.split('|');
        query = query.or(
          `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${cursorId})`,
        );
      }

      query = query.limit(input.limit + 1);

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Fehler beim Laden deiner Themen: ${error.message}`,
        });
      }

      const rows = (data ?? []) as AnyRow[];
      const hasMore = rows.length > input.limit;
      const items = hasMore ? rows.slice(0, input.limit) : rows;

      let nextCursor: string | null = null;

      if (hasMore && items.length > 0) {
        const last = items[items.length - 1];
        nextCursor = `${last.created_at}|${last.id}`;
      }

      return { items, nextCursor };
    }),

  // ── Phase 126: Publish ───────────────────────────────────────────

  publish: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const { data: topic, error: fetchError } = await admin
        .from('topics')
        .select('id, status, created_by')
        .eq('id', input.topicId)
        .single();

      if (fetchError || !topic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thema nicht gefunden.',
        });
      }

      if ((topic as AnyRow).created_by !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Du kannst nur eigene Themen veröffentlichen.',
        });
      }

      if ((topic as AnyRow).status !== 'draft') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Nur Entwürfe können veröffentlicht werden.',
        });
      }

      const { error: updateError } = await admin
        .from('topics')
        .update({
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.topicId);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Status konnte nicht aktualisiert werden: ${updateError.message}`,
        });
      }

      return { published: true as const };
    }),

  // ── Phase 126: Support ───────────────────────────────────────────

  support: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      // --- Fetch topic ---
      const { data: topic, error: fetchError } = await admin
        .from('topics')
        .select('id, status, title, duration, created_by, supporter_count')
        .eq('id', input.topicId)
        .single();

      if (fetchError || !topic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thema nicht gefunden.',
        });
      }

      if ((topic as AnyRow).status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Nur Themen im Status "ausstehend" können unterstützt werden.',
        });
      }

      // --- Check duplicate support ---
      const { data: existing } = await admin
        .from('topic_supporters')
        .select('id')
        .eq('topic_id', input.topicId)
        .eq('user_id', userId)
        .limit(1);

      if (existing && existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Du unterstützt dieses Thema bereits.',
        });
      }

      // --- Insert supporter ---
      const { error: insertError } = await admin
        .from('topic_supporters')
        .insert({
          topic_id: input.topicId,
          user_id: userId,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        // Handle unique constraint race condition
        if (insertError.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Du unterstützt dieses Thema bereits.',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Unterstützung konnte nicht gespeichert werden: ${insertError.message}`,
        });
      }

      // --- Increment supporter_count ---
      const currentCount = ((topic as AnyRow).supporter_count ?? 0) as number;
      const newCount = currentCount + 1;

      const { error: updateCountError } = await admin
        .from('topics')
        .update({
          supporter_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.topicId);

      if (updateCountError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Zähler konnte nicht aktualisiert werden: ${updateCountError.message}`,
        });
      }

      // --- Check activation threshold (10 supporters) ---
      let activated = false;

      if (newCount >= 10) {
        const activatedAt = new Date().toISOString();
        const durationDays = ((topic as AnyRow).duration ?? 14) as number;
        const closesAt = new Date(
          Date.now() + durationDays * 24 * 60 * 60 * 1000,
        ).toISOString();

        const { error: activateError } = await admin
          .from('topics')
          .update({
            status: 'voting',
            activated_at: activatedAt,
            closes_at: closesAt,
            updated_at: activatedAt,
          })
          .eq('id', input.topicId);

        if (!activateError) {
          activated = true;

          // Notify topic creator
          await admin.from('notifications').insert({
            user_id: (topic as AnyRow).created_by,
            type: 'topic_activated',
            payload: {
              topic_id: input.topicId,
              title: (topic as AnyRow).title,
            },
            created_at: activatedAt,
          });
        }
      }

      // --- Award points ---
      await awardPoints(userId, 'TOPIC_SUPPORT', input.topicId);

      // --- Invalidate cache ---
      await cache.del(`topic:${input.topicId}`);

      return {
        supported: true as const,
        newCount,
        activated,
      };
    }),

  // ── Phase 126: Unsupport ─────────────────────────────────────────

  unsupport: protectedProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      // --- Fetch topic ---
      const { data: topic, error: fetchError } = await admin
        .from('topics')
        .select('id, status, supporter_count')
        .eq('id', input.topicId)
        .single();

      if (fetchError || !topic) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Thema nicht gefunden.',
        });
      }

      if ((topic as AnyRow).status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Unterstützung kann nur bei ausstehenden Themen zurückgezogen werden.',
        });
      }

      // --- Delete supporter row ---
      const { error: deleteError, count } = await admin
        .from('topic_supporters')
        .delete({ count: 'exact' })
        .eq('topic_id', input.topicId)
        .eq('user_id', userId);

      if (deleteError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Unterstützung konnte nicht entfernt werden: ${deleteError.message}`,
        });
      }

      if ((count ?? 0) === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Du unterstützt dieses Thema nicht.',
        });
      }

      // --- Decrement supporter_count ---
      const currentCount = ((topic as AnyRow).supporter_count ?? 0) as number;
      const newCount = Math.max(0, currentCount - 1);

      await admin
        .from('topics')
        .update({
          supporter_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.topicId);

      return {
        unsupported: true as const,
        newCount,
      };
    }),

  // ── Phase 126: Close (Moderator, tier >= 3) ──────────────────────

  close: protectedProcedure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .use(requireTier(3) as any)
    .input(
      z.object({
        topicId: z.string().uuid(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const closedAt = new Date().toISOString();

      // --- Update topic ---
      const { error: updateError } = await admin
        .from('topics')
        .update({
          status: 'closed',
          closed_at: closedAt,
          close_reason: input.reason ?? null,
          updated_at: closedAt,
        })
        .eq('id', input.topicId);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Thema konnte nicht geschlossen werden: ${updateError.message}`,
        });
      }

      // --- Audit log ---
      await admin.from('audit_log').insert({
        user_id: ctx.user.id,
        action: 'topic_closed',
        resource_type: 'topic',
        resource_id: input.topicId,
        payload: {
          reason: input.reason ?? null,
        },
        created_at: closedAt,
      });

      // --- Invalidate cache ---
      await cache.del(`topic:${input.topicId}`);

      return { closed: true as const };
    }),
});
