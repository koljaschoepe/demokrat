/**
 * Phase 121 — Demokratie-Puls Platform Metrics
 *
 * Berechnet taeglichen Composite-Score (0-100) aus 5 Dimensionen:
 *   - Partizipation (0-30)
 *   - Abstimmungsaktivitaet (0-25)
 *   - Bridging-Qualitaet (0-20)
 *   - Wahlkreis-Abdeckung (0-15)
 *   - Themen-Diversitaet (0-10)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export interface PlatformMetricsRow {
  metric_date: string;
  active_users_today: number;
  votes_today: number;
  avg_bridging_score: number;
  active_wahlkreise: number;
  diversity_index: number;
  mdb_emails_sent: number;
  puls_score: number;
  updated_at: string;
}

export interface PulsScoreResult {
  score: number;
  components: { name: string; value: number; max: number }[];
}

// ─── Constants ──────────────────────────────────────────────────────────

const CACHE_KEY_LATEST = 'platform:metrics:latest';
const CACHE_TTL_LATEST = 300; // 5 Minuten

// Target thresholds for Puls-Score components
const TARGET_ACTIVE_USERS = 1000;
const TARGET_VOTES = 500;
const TOTAL_WAHLKREISE = 299;

// Max points per component
const MAX_PARTICIPATION = 30;
const MAX_VOTING = 25;
const MAX_BRIDGING = 20;
const MAX_COVERAGE = 15;
const MAX_DIVERSITY = 10;

// ─── CET Date Helper ────────────────────────────────────────────────────

function getTodayCET(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

// ─── Puls Score Calculation ─────────────────────────────────────────────

function calculatePulsScore(metrics: {
  active_users_today: number;
  votes_today: number;
  avg_bridging_score: number;
  active_wahlkreise: number;
  diversity_index: number;
}): { score: number; components: { name: string; value: number; max: number }[] } {
  const participation = Math.min(
    (metrics.active_users_today / TARGET_ACTIVE_USERS) * MAX_PARTICIPATION,
    MAX_PARTICIPATION,
  );
  const voting = Math.min(
    (metrics.votes_today / TARGET_VOTES) * MAX_VOTING,
    MAX_VOTING,
  );
  const bridging = metrics.avg_bridging_score * MAX_BRIDGING;
  const coverage = Math.min(
    (metrics.active_wahlkreise / TOTAL_WAHLKREISE) * MAX_COVERAGE,
    MAX_COVERAGE,
  );
  const diversity = metrics.diversity_index * MAX_DIVERSITY;

  const score = Math.round((participation + voting + bridging + coverage + diversity) * 10) / 10;

  return {
    score: Math.min(score, 100),
    components: [
      { name: 'Partizipation', value: Math.round(participation * 10) / 10, max: MAX_PARTICIPATION },
      { name: 'Abstimmungen', value: Math.round(voting * 10) / 10, max: MAX_VOTING },
      { name: 'Bridging', value: Math.round(bridging * 10) / 10, max: MAX_BRIDGING },
      { name: 'Wahlkreis-Abdeckung', value: Math.round(coverage * 10) / 10, max: MAX_COVERAGE },
      { name: 'Themen-Diversitaet', value: Math.round(diversity * 10) / 10, max: MAX_DIVERSITY },
    ],
  };
}

// ─── Daily Metrics Computation ──────────────────────────────────────────

/**
 * Berechnet die taeglichen Plattform-Metriken und den Demokratie-Puls.
 * Wird taeglich via Cron aufgerufen.
 */
export async function computeDailyMetrics(): Promise<PlatformMetricsRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const today = getTodayCET();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  // --- active_users_today: distinct user_id aus daily_activity ---
  const { data: activeRows } = await supabase
    .from('daily_activity')
    .select('user_id')
    .eq('activity_date', today);

  const activeUserIds = new Set(
    ((activeRows ?? []) as AnyRow[]).map((r: AnyRow) => r.user_id as string),
  );
  const activeUsersToday = activeUserIds.size;

  // --- votes_today: Anzahl VoteCast-Events heute ---
  const todayStart = `${today}T00:00:00.000Z`;
  const todayEnd = `${today}T23:59:59.999Z`;

  const { count: votesToday } = await supabase
    .from('vote_events')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', todayStart)
    .lte('created_at', todayEnd)
    .eq('event_type', 'VoteCast');

  // --- avg_bridging_score: Letzte 7 Tage ---
  const { data: bridgingRows } = await supabase
    .from('comments')
    .select('bridging_score')
    .gte('created_at', sevenDaysAgo)
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

  // --- active_wahlkreise: Wahlkreise mit active_users_week > 0 ---
  const { count: activeWahlkreise } = await supabase
    .from('wahlkreis_stats')
    .select('wahlkreis_id', { count: 'exact', head: true })
    .gt('active_users_week', 0);

  // --- diversity_index: Durchschnittliche category_diversity ---
  const { data: diversityRows } = await supabase
    .from('wahlkreis_stats')
    .select('category_diversity');

  let diversityIndex = 0.5; // Default
  const diversityValues = (diversityRows ?? []) as AnyRow[];
  if (diversityValues.length > 0) {
    const sum = diversityValues.reduce(
      (acc: number, r: AnyRow) => acc + ((r.category_diversity as number) ?? 0),
      0,
    );
    diversityIndex = Math.round((sum / diversityValues.length) * 1000) / 1000;
  }

  // --- mdb_emails_sent: Summe ueber alle Wahlkreise ---
  const { data: emailRows } = await supabase
    .from('wahlkreis_stats')
    .select('mdb_emails_sent');

  const mdbEmailsSent = ((emailRows ?? []) as AnyRow[]).reduce(
    (acc: number, r: AnyRow) => acc + ((r.mdb_emails_sent as number) ?? 0),
    0,
  );

  // --- Puls-Score berechnen ---
  const { score: pulsScore } = calculatePulsScore({
    active_users_today: activeUsersToday,
    votes_today: votesToday ?? 0,
    avg_bridging_score: avgBridgingScore,
    active_wahlkreise: activeWahlkreise ?? 0,
    diversity_index: diversityIndex,
  });

  // --- UPSERT ---
  const metricsRow: PlatformMetricsRow = {
    metric_date: today,
    active_users_today: activeUsersToday,
    votes_today: votesToday ?? 0,
    avg_bridging_score: avgBridgingScore,
    active_wahlkreise: activeWahlkreise ?? 0,
    diversity_index: diversityIndex,
    mdb_emails_sent: mdbEmailsSent,
    puls_score: pulsScore,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase
    .from('platform_metrics')
    .upsert(metricsRow, { onConflict: 'metric_date' });

  if (upsertError) {
    throw new Error(
      `Plattform-Metriken konnten nicht gespeichert werden: ${upsertError.message}`,
    );
  }

  // Cache invalidieren
  await cache.del(CACHE_KEY_LATEST);

  return metricsRow;
}

// ─── Abfragen ───────────────────────────────────────────────────────────

/**
 * Gibt die aktuellsten Plattform-Metriken zurueck.
 * Gecacht fuer 5 Minuten.
 */
export async function getLatestMetrics(): Promise<PlatformMetricsRow | null> {
  const cached = await cache.get<PlatformMetricsRow>(CACHE_KEY_LATEST);
  if (cached) return cached;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data, error } = await supabase
    .from('platform_metrics')
    .select('*')
    .order('metric_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  const row = data as PlatformMetricsRow;
  await cache.set(CACHE_KEY_LATEST, row, CACHE_TTL_LATEST);
  return row;
}

/**
 * Gibt den aktuellen Puls-Score mit Komponenten-Aufschluesselung zurueck.
 * Leitet sich aus den aktuellsten Metriken ab.
 */
export async function getPulsScore(): Promise<PulsScoreResult> {
  const metrics = await getLatestMetrics();

  if (!metrics) {
    // Keine Daten vorhanden – Standardwerte
    return {
      score: 0,
      components: [
        { name: 'Partizipation', value: 0, max: MAX_PARTICIPATION },
        { name: 'Abstimmungen', value: 0, max: MAX_VOTING },
        { name: 'Bridging', value: 0, max: MAX_BRIDGING },
        { name: 'Wahlkreis-Abdeckung', value: 0, max: MAX_COVERAGE },
        { name: 'Themen-Diversitaet', value: 0, max: MAX_DIVERSITY },
      ],
    };
  }

  return calculatePulsScore({
    active_users_today: metrics.active_users_today,
    votes_today: metrics.votes_today,
    avg_bridging_score: metrics.avg_bridging_score,
    active_wahlkreise: metrics.active_wahlkreise,
    diversity_index: metrics.diversity_index,
  });
}
