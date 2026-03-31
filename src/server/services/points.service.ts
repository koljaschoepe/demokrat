import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import { isSitzungswocheActive } from '@/server/services/sitzungswoche.service';
import {
  POINT_VALUES,
  SITZUNGSWOCHE_MULTIPLIER,
  type PointAction,
} from '@/lib/constants/gamification';
import { computeAndUpdateTier } from './privileges.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export interface PointsResult {
  points: number;
  newTotal: number;
  tierChanged: boolean;
  newTier?: number;
}

/**
 * Vergibt Punkte für eine Nutzeraktion.
 *
 * - Prüft Idempotenz anhand (user_id, action, reference_id) in reputation_events
 * - Wendet 2x-Multiplikator während Sitzungswochen an
 * - Aktualisiert reputation_points im Profil
 * - Prüft und aktualisiert ggf. die Privilegstufe
 */
export async function awardPoints(
  userId: string,
  action: PointAction,
  referenceId?: string,
): Promise<PointsResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // --- Idempotenz-Prüfung ---
  if (referenceId) {
    const { data: existing } = await supabase
      .from('reputation_events')
      .select('id')
      .eq('user_id', userId)
      .eq('action', action)
      .eq('reference_id', referenceId)
      .limit(1);

    if (existing && existing.length > 0) {
      // Bereits vergeben – aktuellen Stand zurückgeben
      const { data: profile } = await supabase
        .from('profiles')
        .select('reputation_points, privilege_tier')
        .eq('id', userId)
        .single();

      const total = (profile as AnyRow)?.reputation_points ?? 0;
      return { points: 0, newTotal: total, tierChanged: false };
    }
  }

  // --- Punkte berechnen ---
  const basePoints = POINT_VALUES[action];
  const sitzungswoche = await isSitzungswocheActive();
  const multiplier = sitzungswoche ? SITZUNGSWOCHE_MULTIPLIER : 1;
  const points = basePoints * multiplier;

  // --- Event einfügen ---
  const { error: insertError } = await supabase
    .from('reputation_events')
    .insert({
      user_id: userId,
      action,
      points,
      reference_id: referenceId ?? null,
      multiplier,
      created_at: new Date().toISOString(),
    });

  if (insertError) {
    // Unique-Constraint-Verletzung → Idempotenz-Fall (Race Condition)
    if (insertError.code === '23505') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('reputation_points, privilege_tier')
        .eq('id', userId)
        .single();

      const total = (profile as AnyRow)?.reputation_points ?? 0;
      return { points: 0, newTotal: total, tierChanged: false };
    }
    throw new Error(`Punkte konnten nicht vergeben werden: ${insertError.message}`);
  }

  // --- Profil-Punkte aktualisieren ---
  const { data: updatedProfile, error: updateError } = await supabase.rpc(
    'increment_reputation_points',
    { p_user_id: userId, p_points: points },
  );

  // Fallback: Wenn die RPC-Funktion nicht existiert, manuell aktualisieren
  let newTotal: number;
  if (updateError) {
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('reputation_points')
      .eq('id', userId)
      .single();

    const currentPoints = (currentProfile as AnyRow)?.reputation_points ?? 0;
    newTotal = currentPoints + points;

    const { error: fallbackError } = await supabase
      .from('profiles')
      .update({ reputation_points: newTotal, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (fallbackError) {
      throw new Error(`Profil-Punkte konnten nicht aktualisiert werden: ${fallbackError.message}`);
    }
  } else {
    newTotal = (updatedProfile as AnyRow) ?? 0;
  }

  // --- Tagesaktivität erfassen ---
  const todayISO = new Date().toISOString().split('T')[0];
  await supabase
    .from('daily_activity')
    .upsert(
      {
        user_id: userId,
        date: todayISO,
        points_earned: points,
        actions_count: 1,
      },
      { onConflict: 'user_id,date' },
    )
    .then(async () => {
      // Inkrementiere Werte falls Zeile schon existierte
      await supabase.rpc('increment_daily_activity', {
        p_user_id: userId,
        p_date: todayISO,
        p_points: points,
      });
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .catch((_err: any) => {
      // Nicht-kritisch: Tagesaktivität ist nur Statistik
    });

  // --- Privilegstufe prüfen ---
  const tierResult = await computeAndUpdateTier(userId);

  // --- Cache invalidieren ---
  await cache.del(`user:points:${userId}`);

  return {
    points,
    newTotal,
    tierChanged: tierResult.changed,
    ...(tierResult.changed ? { newTier: tierResult.newTier } : {}),
  };
}

/**
 * Gibt die aktuelle Punktzahl eines Nutzers zurück (mit Redis-Cache).
 */
export async function getUserPoints(userId: string): Promise<number> {
  const cacheKey = `user:points:${userId}`;
  const cached = await cache.get<number>(cacheKey);
  if (cached !== null) return cached;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data } = await supabase
    .from('profiles')
    .select('reputation_points')
    .eq('id', userId)
    .single();

  const points = (data as AnyRow)?.reputation_points ?? 0;
  await cache.set(cacheKey, points, 300); // 5 Minuten Cache
  return points;
}
