/**
 * Phase 157+158 — Map tRPC Router
 *
 * Provides wahlkreis stats, dashboard data, and leaderboard for the map view.
 */

import { z } from 'zod/v4';
import { router, publicProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import {
  getWahlkreisStats,
  getTopWahlkreise,
} from '@/server/services/wahlkreis-stats.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export const mapRouter = router({
  /**
   * Get dashboard data for a specific wahlkreis.
   * Combines stats + MdB info + top topics + wahlkreis meta.
   */
  wahlkreisDashboard: publicProcedure
    .input(z.object({ wahlkreisId: z.number().int().min(1).max(299) }))
    .query(async ({ input }) => {
      const { wahlkreisId } = input;
      const cacheKey = `map:dashboard:${wahlkreisId}`;
      const cached = await cache.get<AnyRow>(cacheKey);
      if (cached) return cached;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createAdminClient() as any;

      // 0. Wahlkreis meta (name, bundesland)
      const { data: wahlkreisRow } = await supabase
        .from('wahlkreise')
        .select('id, name, bundesland')
        .eq('id', wahlkreisId)
        .maybeSingle();

      const wahlkreisInfo = wahlkreisRow
        ? {
            name: (wahlkreisRow as AnyRow).name as string,
            bundesland: (wahlkreisRow as AnyRow).bundesland as string,
          }
        : null;

      // 1. Wahlkreis stats
      const stats = await getWahlkreisStats(wahlkreisId);

      // 2. MdB for this wahlkreis
      const { data: mdbRow } = await supabase
        .from('mdb_stammdaten')
        .select('id, name, fraktion, foto_url')
        .eq('wahlkreis_nummer', wahlkreisId)
        .limit(1)
        .maybeSingle();

      const mdb = mdbRow
        ? {
            id: (mdbRow as AnyRow).id as string,
            name: (mdbRow as AnyRow).name as string,
            fraktion: (mdbRow as AnyRow).fraktion as string,
            fotoUrl: ((mdbRow as AnyRow).foto_url as string) || null,
          }
        : null;

      // 3. Top 3 topics with most votes from this wahlkreis's users
      const { data: topicRows } = await supabase
        .from('topics')
        .select('id, title, vote_count, status')
        .order('vote_count', { ascending: false })
        .limit(3);

      const topTopics = ((topicRows ?? []) as AnyRow[]).map((t: AnyRow) => ({
        id: t.id as string,
        title: t.title as string,
        voteCount: (t.vote_count ?? 0) as number,
        status: t.status as string,
      }));

      const result = {
        wahlkreisId,
        wahlkreisInfo,
        stats: stats
          ? {
              registeredUsers: stats.registered_users,
              activeUsersWeek: stats.active_users_week,
              votesWeek: stats.votes_week,
              avgBridgingScore: stats.avg_bridging_score,
              fortschrittStufe: stats.fortschritt_stufe,
            }
          : {
              registeredUsers: 0,
              activeUsersWeek: 0,
              votesWeek: 0,
              avgBridgingScore: 0,
              fortschrittStufe: 1,
            },
        mdb,
        topTopics,
      };

      await cache.set(cacheKey, result, 300); // 5 min cache
      return result;
    }),

  /**
   * Get stats for all wahlkreise (for choropleth coloring).
   * Returns wahlkreis_id + fortschritt_stufe pairs.
   */
  allStats: publicProcedure.query(async () => {
    const cacheKey = 'map:allStats';
    const cached = await cache.get<AnyRow[]>(cacheKey);
    if (cached) return cached;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('wahlkreis_stats')
      .select('wahlkreis_id, fortschritt_stufe, active_users_week');

    if (error) {
      console.error('[map.allStats] Error fetching stats:', error);
      return [] as { wahlkreis_id: number; fortschritt_stufe: number; active_users_week: number }[];
    }

    const result = (data as AnyRow[]).map((r: AnyRow) => ({
      wahlkreis_id: r.wahlkreis_id as number,
      fortschritt_stufe: r.fortschritt_stufe as number,
      active_users_week: r.active_users_week as number,
    }));

    await cache.set(cacheKey, result, 600); // 10 min cache
    return result;
  }),

  /**
   * Leaderboard: Top wahlkreise by activity.
   */
  leaderboard: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      return getTopWahlkreise(input.limit);
    }),
});
