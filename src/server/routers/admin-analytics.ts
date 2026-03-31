/**
 * Phase 170 -- Admin Analytics Router
 */
import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireTier } from '@/server/middleware/requireTier';
import { cache } from '@/lib/redis/cache';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export const adminAnalyticsRouter = router({
  /**
   * Overview stats: total users, WAU, DAU, total votes, votes this week, avg bridging score.
   * Cached for 5 minutes.
   */
  overview: protectedProcedure
    .use(requireTier(3) as any)
    .query(async () => {
      const cached = await cache.get<any>('admin:analytics:overview');
      if (cached) return cached;

      const admin = createAdminClient() as any;

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const todayBerlin = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });

      const [
        totalUsers,
        wau,
        dau,
        totalVotes,
        votesThisWeek,
        latestMetrics,
      ] = await Promise.all([
        admin
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .then((r: AnyRow) => r.count ?? 0),
        // WAU: users who have daily_activity in last 7 days
        admin
          .from('daily_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('activity_date', weekAgo.slice(0, 10))
          .then((r: AnyRow) => r.count ?? 0),
        // DAU: users active today
        admin
          .from('daily_activity')
          .select('user_id', { count: 'exact', head: true })
          .eq('activity_date', todayBerlin)
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('vote_events')
          .select('event_id', { count: 'exact', head: true })
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('vote_events')
          .select('event_id', { count: 'exact', head: true })
          .gte('created_at', weekAgo)
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('platform_metrics')
          .select('avg_bridging_score')
          .order('metric_date', { ascending: false })
          .limit(1)
          .single()
          .then((r: AnyRow) => r.data),
      ]);

      const result = {
        totalUsers: totalUsers as number,
        wau: wau as number,
        dau: dau as number,
        totalVotes: totalVotes as number,
        votesThisWeek: votesThisWeek as number,
        avgBridgingScore: latestMetrics?.avg_bridging_score ?? 0,
      };

      await cache.set('admin:analytics:overview', result, 300);
      return result;
    }),

  /**
   * Daily registration counts for last 30 days.
   */
  registrationTrend: protectedProcedure
    .use(requireTier(3) as any)
    .query(async () => {
      const admin = createAdminClient() as any;

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch profiles created in last 30 days, then group client-side
      const { data, error } = await admin
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Group by date
      const countsByDate: Record<string, number> = {};
      for (const row of (data ?? []) as AnyRow[]) {
        const date = new Date(row.created_at).toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
        countsByDate[date] = (countsByDate[date] ?? 0) + 1;
      }

      // Build full 30-day array (fill gaps with 0)
      const result: { date: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
        result.push({ date: dateStr, count: countsByDate[dateStr] ?? 0 });
      }

      return result;
    }),

  /**
   * Daily vote counts for last 30 days.
   */
  voteTrend: protectedProcedure
    .use(requireTier(3) as any)
    .query(async () => {
      const admin = createAdminClient() as any;

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await admin
        .from('vote_events')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      const countsByDate: Record<string, number> = {};
      for (const row of (data ?? []) as AnyRow[]) {
        const date = new Date(row.created_at).toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
        countsByDate[date] = (countsByDate[date] ?? 0) + 1;
      }

      const result: { date: string; count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
        result.push({ date: dateStr, count: countsByDate[dateStr] ?? 0 });
      }

      return result;
    }),

  /**
   * Top 10 topics by vote count this week.
   */
  topTopics: protectedProcedure
    .use(requireTier(3) as any)
    .query(async () => {
      const admin = createAdminClient() as any;

      const { data, error } = await admin
        .from('topics')
        .select('id, title, category, vote_count')
        .in('status', ['active', 'voting_closed'])
        .order('vote_count', { ascending: false })
        .limit(10);

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      return (data ?? []).map((t: AnyRow) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        voteCount: t.vote_count,
      }));
    }),

  /**
   * Top 10 wahlkreise by active users (from wahlkreis_stats).
   */
  topWahlkreise: protectedProcedure
    .use(requireTier(3) as any)
    .query(async () => {
      const admin = createAdminClient() as any;

      const { data, error } = await admin
        .from('wahlkreis_stats')
        .select('wahlkreis_id, registered_users, active_users_week, votes_week, avg_bridging_score')
        .order('active_users_week', { ascending: false })
        .limit(10);

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Enrich with wahlkreis names
      const ids = (data ?? []).map((d: AnyRow) => d.wahlkreis_id);
      const { data: wahlkreise } = ids.length > 0
        ? await admin.from('wahlkreise').select('id, name').in('id', ids)
        : { data: [] };

      const nameMap: Record<number, string> = {};
      for (const wk of (wahlkreise ?? []) as AnyRow[]) {
        nameMap[wk.id] = wk.name;
      }

      return (data ?? []).map((d: AnyRow) => ({
        wahlkreisId: d.wahlkreis_id,
        name: nameMap[d.wahlkreis_id] ?? `WK ${d.wahlkreis_id}`,
        registeredUsers: d.registered_users,
        activeUsersWeek: d.active_users_week,
        votesWeek: d.votes_week,
        avgBridgingScore: d.avg_bridging_score,
      }));
    }),
});
