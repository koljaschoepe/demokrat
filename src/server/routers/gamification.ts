/**
 * Phase 119 & 121 — Gamification tRPC Router
 *
 * Endpunkte fuer Demokratie-Puls, Wahlkreis-Statistiken,
 * Nutzer-Punkte und Punktehistorie.
 */

import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPulsScore, getLatestMetrics } from '../services/platform-metrics.service';
import {
  getWahlkreisStats,
  getTopWahlkreise,
} from '../services/wahlkreis-stats.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ─── Router ─────────────────────────────────────────────────────────────

export const gamificationRouter = router({
  /**
   * Demokratie-Puls Score mit Komponenten-Aufschluesselung.
   * Oeffentlich zugaenglich.
   */
  pulsScore: publicProcedure.query(async () => {
    return getPulsScore();
  }),

  /**
   * Aktuelle Plattform-Metriken (heute).
   * Oeffentlich zugaenglich.
   */
  latestMetrics: publicProcedure.query(async () => {
    const metrics = await getLatestMetrics();
    if (!metrics) {
      return null;
    }
    return metrics;
  }),

  /**
   * Statistiken fuer einen einzelnen Wahlkreis.
   * Oeffentlich zugaenglich.
   */
  wahlkreisStats: publicProcedure
    .input(z.object({ wahlkreisId: z.number() }))
    .query(async ({ input }) => {
      const stats = await getWahlkreisStats(input.wahlkreisId);
      if (!stats) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Statistiken für diesen Wahlkreis nicht gefunden.',
        });
      }
      return stats;
    }),

  /**
   * Top-Wahlkreise nach Aktivitaet sortiert.
   * Oeffentlich zugaenglich.
   */
  topWahlkreise: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(async ({ input }) => {
      return getTopWahlkreise(input.limit);
    }),

  /**
   * Eigene Punkte, Privilegstufe und aktuelle Streak.
   * Erfordert Authentifizierung.
   */
  myPoints: protectedProcedure.query(async ({ ctx }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;
    const userId = ctx.user.id;

    // Profil-Daten laden
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('reputation_points, privilege_tier')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Profil nicht gefunden.',
      });
    }

    const profileRow = profile as AnyRow;

    // Streak-Daten laden
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, last_active_date, streak_shields')
      .eq('user_id', userId)
      .single();

    const streakRow = streak as AnyRow;

    return {
      reputationPoints: (profileRow.reputation_points ?? 0) as number,
      privilegeTier: (profileRow.privilege_tier ?? 1) as number,
      currentStreak: (streakRow?.current_streak ?? 0) as number,
      longestStreak: (streakRow?.longest_streak ?? 0) as number,
      lastActiveDate: (streakRow?.last_active_date ?? null) as string | null,
      streakShields: (streakRow?.streak_shields ?? 0) as number,
    };
  }),

  /**
   * Paginierte Punktehistorie (reputation_events).
   * Erfordert Authentifizierung.
   */
  pointsHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createAdminClient() as any;
      const userId = ctx.user.id;
      const { limit, cursor } = input;

      // Query mit Cursor-basierter Pagination (created_at als Cursor)
      let query = supabase
        .from('reputation_events')
        .select('id, action, points, multiplier, reference_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit + 1); // +1 fuer nextCursor-Erkennung

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Punktehistorie konnte nicht geladen werden: ${error.message}`,
        });
      }

      const rows = (data ?? []) as AnyRow[];
      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;

      const nextCursor = hasMore
        ? (items[items.length - 1].created_at as string)
        : undefined;

      return {
        items: items.map((row: AnyRow) => ({
          id: row.id as string,
          action: row.action as string,
          points: row.points as number,
          multiplier: (row.multiplier ?? 1) as number,
          referenceId: (row.reference_id ?? null) as string | null,
          createdAt: row.created_at as string,
        })),
        nextCursor,
      };
    }),
});
