/**
 * Phase 119 — Wahlkreis Stats Aggregation
 *
 * Aggregiert Statistiken pro Wahlkreis alle 6 Stunden via Cron.
 * Berechnet Fortschrittstufe (1-5) basierend auf Composite Score.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export interface WahlkreisStatsRow {
  wahlkreis_id: number;
  registered_users: number;
  active_users_week: number;
  votes_week: number;
  avg_bridging_score: number;
  category_diversity: number;
  mdb_emails_sent: number;
  fortschritt_stufe: number;
  updated_at: string;
}

// ─── Constants ──────────────────────────────────────────────────────────

const TOTAL_CATEGORIES = 10;
const CACHE_KEY_STATS = 'wahlkreis:stats';
const CACHE_KEY_TOP = 'wahlkreis:top';
const CACHE_TTL_STATS = 600; // 10 Minuten
const CACHE_TTL_TOP = 1800; // 30 Minuten

// ─── Fortschritt-Stufe Berechnung ───────────────────────────────────────

/**
 * Berechnet die Fortschrittsstufe 1-5 basierend auf einem Composite Score:
 *   1: registered >= 10
 *   2: active_users_week >= 5
 *   3: votes_week >= 20
 *   4: category_diversity > 0.5
 *   5: avg_bridging_score > 0.6
 *
 * Die Stufe ist die hoechste erfuellte Bedingung, wobei alle
 * niedrigeren Bedingungen ebenfalls erfuellt sein muessen.
 */
function computeFortschrittStufe(
  registeredUsers: number,
  activeUsersWeek: number,
  votesWeek: number,
  categoryDiversity: number,
  avgBridgingScore: number,
): number {
  if (registeredUsers < 10) return 1;
  if (activeUsersWeek < 5) return 2;
  if (votesWeek < 20) return 3;
  if (categoryDiversity <= 0.5) return 4;
  if (avgBridgingScore <= 0.6) return 4;
  return 5;
}

// ─── Aggregation ────────────────────────────────────────────────────────

/**
 * Aggregiert Wahlkreis-Statistiken fuer alle aktiven Wahlkreise.
 * Wird alle 6 Stunden via Cron aufgerufen.
 */
export async function aggregateWahlkreisStats(): Promise<{
  updated: number;
  errors: string[];
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const errors: string[] = [];
  let updated = 0;

  // 1. Alle distinct wahlkreis_ids aus profiles
  const { data: wahlkreisRows, error: wkError } = await supabase
    .from('profiles')
    .select('wahlkreis_id')
    .not('wahlkreis_id', 'is', null);

  if (wkError) {
    errors.push(`Wahlkreis-IDs konnten nicht geladen werden: ${wkError.message}`);
    return { updated, errors };
  }

  const allRows = (wahlkreisRows ?? []) as AnyRow[];
  const wahlkreisIds = [...new Set(allRows.map((r: AnyRow) => r.wahlkreis_id as number))];

  if (wahlkreisIds.length === 0) {
    return { updated: 0, errors: [] };
  }

  // Datumsgrenzen
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  for (const wahlkreisId of wahlkreisIds) {
    try {
      // --- Nutzer-IDs im Wahlkreis ---
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('id')
        .eq('wahlkreis_id', wahlkreisId);

      const profiles = (profileRows ?? []) as AnyRow[];
      const userIds = profiles.map((p: AnyRow) => p.id as string);
      const registeredUsers = userIds.length;

      if (registeredUsers === 0) continue;

      // --- active_users_week: distinct user_id in daily_activity ---
      const { data: activeRows } = await supabase
        .from('daily_activity')
        .select('user_id')
        .in('user_id', userIds)
        .gte('activity_date', sevenDaysAgo);

      const activeUserIds = new Set(
        ((activeRows ?? []) as AnyRow[]).map((r: AnyRow) => r.user_id as string),
      );
      const activeUsersWeek = activeUserIds.size;

      // --- votes_week: vote_events der letzten 7 Tage ---
      const { count: votesWeek } = await supabase
        .from('vote_events')
        .select('id', { count: 'exact', head: true })
        .in('user_id', userIds)
        .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('event_type', 'VoteCast');

      // --- avg_bridging_score: Durchschnitt der letzten 30 Tage ---
      const { data: bridgingRows } = await supabase
        .from('comments')
        .select('bridging_score')
        .in('user_id', userIds)
        .gte('created_at', thirtyDaysAgo)
        .not('bridging_score', 'is', null);

      let avgBridgingScore = 0.5; // Default
      const bridgingValues = (bridgingRows ?? []) as AnyRow[];
      if (bridgingValues.length > 0) {
        const sum = bridgingValues.reduce(
          (acc: number, r: AnyRow) => acc + (r.bridging_score as number),
          0,
        );
        avgBridgingScore = Math.round((sum / bridgingValues.length) * 1000) / 1000;
      }

      // --- category_diversity: distinct Kategorien der Themen ---
      const { data: voteEventRows } = await supabase
        .from('vote_events')
        .select('stream_id')
        .in('user_id', userIds)
        .eq('event_type', 'VoteCast');

      const topicIds = [
        ...new Set(((voteEventRows ?? []) as AnyRow[]).map((r: AnyRow) => r.stream_id as string)),
      ];

      let categoryDiversity = 0;
      if (topicIds.length > 0) {
        const { data: topicRows } = await supabase
          .from('topics')
          .select('category')
          .in('id', topicIds)
          .not('category', 'is', null);

        const distinctCategories = new Set(
          ((topicRows ?? []) as AnyRow[]).map((r: AnyRow) => r.category as string),
        );
        categoryDiversity =
          Math.round((distinctCategories.size / TOTAL_CATEGORIES) * 1000) / 1000;
        categoryDiversity = Math.min(categoryDiversity, 1);
      }

      // --- mdb_emails_sent: aus bestehendem Datensatz uebernehmen (Platzhalter) ---
      const { data: existingStats } = await supabase
        .from('wahlkreis_stats')
        .select('mdb_emails_sent')
        .eq('wahlkreis_id', wahlkreisId)
        .single();

      const mdbEmailsSent = ((existingStats as AnyRow)?.mdb_emails_sent ?? 0) as number;

      // --- Fortschrittstufe berechnen ---
      const fortschrittStufe = computeFortschrittStufe(
        registeredUsers,
        activeUsersWeek,
        votesWeek ?? 0,
        categoryDiversity,
        avgBridgingScore,
      );

      // --- UPSERT ---
      const { error: upsertError } = await supabase.from('wahlkreis_stats').upsert(
        {
          wahlkreis_id: wahlkreisId,
          registered_users: registeredUsers,
          active_users_week: activeUsersWeek,
          votes_week: votesWeek ?? 0,
          avg_bridging_score: avgBridgingScore,
          category_diversity: categoryDiversity,
          mdb_emails_sent: mdbEmailsSent,
          fortschritt_stufe: fortschrittStufe,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'wahlkreis_id' },
      );

      if (upsertError) {
        errors.push(`Wahlkreis ${wahlkreisId}: ${upsertError.message}`);
      } else {
        updated++;
        // Cache fuer diesen Wahlkreis invalidieren
        await cache.del(`${CACHE_KEY_STATS}:${wahlkreisId}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`Wahlkreis ${wahlkreisId}: Unerwarteter Fehler – ${message}`);
    }
  }

  // Top-Wahlkreise Cache invalidieren
  await cache.del(CACHE_KEY_TOP);

  return { updated, errors };
}

// ─── Abfragen ───────────────────────────────────────────────────────────

/**
 * Gibt die Statistiken fuer einen Wahlkreis zurueck.
 * Gecacht fuer 10 Minuten.
 */
export async function getWahlkreisStats(
  wahlkreisId: number,
): Promise<WahlkreisStatsRow | null> {
  const cacheKey = `${CACHE_KEY_STATS}:${wahlkreisId}`;
  const cached = await cache.get<WahlkreisStatsRow>(cacheKey);
  if (cached) return cached;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data, error } = await supabase
    .from('wahlkreis_stats')
    .select('*')
    .eq('wahlkreis_id', wahlkreisId)
    .single();

  if (error || !data) return null;

  const row = data as WahlkreisStatsRow;
  await cache.set(cacheKey, row, CACHE_TTL_STATS);
  return row;
}

/**
 * Gibt die Top-Wahlkreise sortiert nach active_users_week zurueck.
 * Gecacht fuer 30 Minuten.
 */
export async function getTopWahlkreise(
  limit: number = 10,
): Promise<WahlkreisStatsRow[]> {
  const cacheKey = `${CACHE_KEY_TOP}:${limit}`;
  const cached = await cache.get<WahlkreisStatsRow[]>(cacheKey);
  if (cached) return cached;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data, error } = await supabase
    .from('wahlkreis_stats')
    .select('*')
    .order('active_users_week', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  const rows = data as WahlkreisStatsRow[];
  await cache.set(cacheKey, rows, CACHE_TTL_TOP);
  return rows;
}
