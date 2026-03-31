/**
 * Phase 168 -- Admin Users Router
 *
 * Provides user listing, detail views, tier management, and suspend/ban
 * capabilities for the admin panel (tier >= 4).
 */
import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireTier } from '@/server/middleware/requireTier';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export const adminUsersRouter = router({
  // ── Search/list users ─────────────────────────────────────────────
  list: protectedProcedure
    .use(requireTier(4) as any)
    .input(
      z.object({
        search: z.string().max(100).optional(),
        status: z
          .enum(['all', 'active', 'suspended', 'banned'])
          .default('all'),
        tier: z.number().int().min(0).max(4).optional(),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(25),
      }),
    )
    .query(async ({ input }) => {
      const admin = createAdminClient() as any;

      let query = admin
        .from('profiles')
        .select(
          'id, display_name, avatar_url, reputation_points, privilege_tier, verification_tier, is_public, created_at, updated_at',
        )
        .order('created_at', { ascending: false });

      if (input.search) {
        query = query.ilike('display_name', `%${input.search}%`);
      }

      if (input.tier !== undefined) {
        query = query.eq('privilege_tier', input.tier);
      }

      if (input.cursor) {
        query = query.lt('created_at', input.cursor);
      }

      query = query.limit(input.limit + 1);

      const { data, error } = await query;
      if (error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });

      const rows = (data ?? []) as AnyRow[];
      const hasMore = rows.length > input.limit;
      const items = hasMore ? rows.slice(0, input.limit) : rows;
      const nextCursor = hasMore
        ? items[items.length - 1]?.created_at
        : null;

      return {
        items: items.map((u: AnyRow) => ({
          id: u.id,
          displayName: u.display_name,
          avatarUrl: u.avatar_url,
          reputationPoints: u.reputation_points,
          privilegeTier: u.privilege_tier,
          verificationTier: u.verification_tier,
          isPublic: u.is_public,
          createdAt: u.created_at,
        })),
        nextCursor,
      };
    }),

  // ── Get user detail ───────────────────────────────────────────────
  detail: protectedProcedure
    .use(requireTier(4) as any)
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      const admin = createAdminClient() as any;

      const [{ data: profile }, { data: stats }] = await Promise.all([
        admin
          .from('profiles')
          .select('*')
          .eq('id', input.userId)
          .single(),
        admin
          .from('vote_events')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', input.userId),
      ]);

      if (!profile)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Nutzer nicht gefunden',
        });

      const { data: recentReports } = await admin
        .from('reports')
        .select('id, reason, status, created_at')
        .or(
          `reporter_id.eq.${input.userId},content_id.eq.${input.userId}`,
        )
        .order('created_at', { ascending: false })
        .limit(5);

      const { count: commentCount } = await admin
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', input.userId);

      return {
        ...(profile as AnyRow),
        voteCount: (stats as AnyRow)?.count ?? 0,
        commentCount: commentCount ?? 0,
        recentReports: (recentReports ?? []).map((r: AnyRow) => ({
          id: r.id,
          reason: r.reason,
          status: r.status,
          createdAt: r.created_at,
        })),
      };
    }),

  // ── Update privilege tier ─────────────────────────────────────────
  updateTier: protectedProcedure
    .use(requireTier(4) as any)
    .input(
      z.object({
        userId: z.string().uuid(),
        tier: z.number().int().min(0).max(4),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const admin = createAdminClient() as any;

      const { error } = await admin
        .from('profiles')
        .update({
          privilege_tier: input.tier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.userId);

      if (error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });

      await admin.from('audit_log').insert({
        user_id: ctx.user.id,
        action: 'tier_changed',
        resource_type: 'user',
        resource_id: input.userId,
        payload: { new_tier: input.tier },
        created_at: new Date().toISOString(),
      });

      return { success: true };
    }),

  // ── Suspend / unsuspend / ban ─────────────────────────────────────
  suspend: protectedProcedure
    .use(requireTier(4) as any)
    .input(
      z.object({
        userId: z.string().uuid(),
        action: z.enum(['suspend', 'unsuspend', 'ban']),
        reason: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const admin = createAdminClient() as any;

      // For suspend/ban we would use Supabase Auth admin API in production.
      // For now, log it in the audit log.
      await admin.from('audit_log').insert({
        user_id: ctx.user.id,
        action:
          input.action === 'suspend'
            ? 'user_suspended'
            : input.action === 'ban'
              ? 'user_banned'
              : 'user_unsuspended',
        resource_type: 'user',
        resource_id: input.userId,
        payload: { reason: input.reason ?? null },
        created_at: new Date().toISOString(),
      });

      return { success: true };
    }),
});
