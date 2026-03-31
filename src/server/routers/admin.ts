/**
 * Phase 165-166 -- tRPC Admin Router
 *
 * Provides dashboard stats, recent activity, sync triggers, and cache management
 * for admin panel (tier >= 3 for read, tier >= 4 for mutations).
 */
import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireTier } from '@/server/middleware/requireTier';
import { cache } from '@/lib/redis/cache';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export const adminRouter = router({
  /**
   * Dashboard stats -- tier >= 3
   * Returns user/vote/topic/report/activity counts with week-over-week changes.
   * Cached for 60 seconds.
   */
  stats: protectedProcedure
    .use(requireTier(3) as any)
    .query(async () => {
      const cached = await cache.get<any>('admin:stats');
      if (cached) return cached;

      const admin = createAdminClient() as any;

      const weekAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const twoWeeksAgo = new Date(
        Date.now() - 14 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const todayBerlin = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Europe/Berlin',
      });

      const [
        totalUsers,
        usersThisWeek,
        usersLastWeek,
        totalVotes,
        votesThisWeek,
        votesLastWeek,
        totalTopics,
        openReports,
        activeToday,
      ] = await Promise.all([
        admin
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekAgo)
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', twoWeeksAgo)
          .lt('created_at', weekAgo)
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('vote_events')
          .select('id', { count: 'exact', head: true })
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('vote_events')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekAgo)
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('vote_events')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', twoWeeksAgo)
          .lt('created_at', weekAgo)
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('topics')
          .select('id', { count: 'exact', head: true })
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('daily_activity')
          .select('id', { count: 'exact', head: true })
          .eq('activity_date', todayBerlin)
          .then((r: AnyRow) => r.count ?? 0),
      ]);

      // Week-over-week percentage changes
      const usersChange =
        usersLastWeek > 0
          ? Math.round(
              ((usersThisWeek - usersLastWeek) / usersLastWeek) * 100,
            )
          : 0;
      const votesChange =
        votesLastWeek > 0
          ? Math.round(
              ((votesThisWeek - votesLastWeek) / votesLastWeek) * 100,
            )
          : 0;

      const result = {
        totalUsers: totalUsers as number,
        usersThisWeek: usersThisWeek as number,
        usersChange,
        totalVotes: totalVotes as number,
        votesThisWeek: votesThisWeek as number,
        votesChange,
        totalTopics: totalTopics as number,
        openReports: openReports as number,
        activeToday: activeToday as number,
      };

      await cache.set('admin:stats', result, 60); // 1 min cache
      return result;
    }),

  /**
   * Recent activity from audit_log -- tier >= 3
   * Returns the 10 most recent audit log entries.
   */
  recentActivity: protectedProcedure
    .use(requireTier(3) as any)
    .query(async () => {
      const admin = createAdminClient() as any;
      const { data, error } = await admin
        .from('audit_log')
        .select(
          'id, user_id, action, resource_type, resource_id, payload, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return (data ?? []).map((row: AnyRow) => ({
        id: row.id,
        action: row.action,
        resourceType: row.resource_type,
        resourceId: row.resource_id,
        payload: row.payload,
        createdAt: row.created_at,
      }));
    }),

  /**
   * Trigger manual data sync -- tier >= 4
   * Logs the action in audit_log and invalidates stats cache.
   */
  triggerSync: protectedProcedure
    .use(requireTier(4) as any)
    .input(
      z.object({
        source: z.enum(['dip', 'abgeordnetenwatch', 'meilisearch', 'content']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const admin = createAdminClient() as any;

      // Log the sync trigger in audit_log
      await admin.from('audit_log').insert({
        user_id: ctx.user.id,
        action: 'sync_triggered',
        resource_type: 'system',
        resource_id: input.source,
        payload: { source: input.source, triggered_by: ctx.user.id },
        created_at: new Date().toISOString(),
      });

      // Invalidate stats cache
      await cache.del('admin:stats');

      return { triggered: true, source: input.source };
    }),

  /**
   * Clear Redis cache -- tier >= 4
   * Clears known cache keys and logs the action.
   */
  clearCache: protectedProcedure
    .use(requireTier(4) as any)
    .mutation(async ({ ctx }) => {
      const admin = createAdminClient() as any;

      // Clear known cache keys
      await Promise.all([
        cache.del('admin:stats'),
        cache.del('feed:trending'),
      ]);

      // Log the cache clear in audit_log
      await admin.from('audit_log').insert({
        user_id: ctx.user.id,
        action: 'cache_cleared',
        resource_type: 'system',
        resource_id: 'redis',
        payload: {},
        created_at: new Date().toISOString(),
      });

      return { cleared: true };
    }),
});
