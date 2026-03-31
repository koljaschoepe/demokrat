import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import { TIER_THRESHOLDS } from '@/lib/constants/gamification';
import type { PrivilegeTier } from '@/lib/auth/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export interface TierResult {
  oldTier: PrivilegeTier;
  newTier: PrivilegeTier;
  changed: boolean;
}

/**
 * Reine Funktion: Berechnet die Privilegstufe (0–4) anhand der Punktzahl.
 */
export function computeTier(points: number): PrivilegeTier {
  let tier: PrivilegeTier = 0;
  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= TIER_THRESHOLDS[i]!) {
      tier = i as PrivilegeTier;
      break;
    }
  }
  return tier;
}

/**
 * Berechnet die Privilegstufe eines Nutzers und aktualisiert sie bei Änderung.
 *
 * - Lädt das Profil aus der Datenbank
 * - Vergleicht berechnete Stufe mit gespeicherter Stufe
 * - Bei Aufstieg: Aktualisiert Profil und erstellt Benachrichtigung
 * - Bei Abstieg: Aktualisiert nur das Profil (kein Benachrichtigungs-Spam)
 */
export async function computeAndUpdateTier(userId: string): Promise<TierResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('reputation_points, privilege_tier')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error(
      `Profil konnte nicht geladen werden: ${profileError?.message ?? 'Nicht gefunden'}`,
    );
  }

  const row = profile as AnyRow;
  const currentPoints: number = row.reputation_points ?? 0;
  const oldTier = (row.privilege_tier ?? 0) as PrivilegeTier;
  const newTier = computeTier(currentPoints);

  if (oldTier === newTier) {
    return { oldTier, newTier, changed: false };
  }

  // --- Privilegstufe aktualisieren ---
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      privilege_tier: newTier,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Privilegstufe konnte nicht aktualisiert werden: ${updateError.message}`);
  }

  // --- Bei Aufstieg: Benachrichtigung erstellen ---
  if (newTier > oldTier) {
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: userId,
      type: 'tier_up',
      payload: {
        old_tier: oldTier,
        new_tier: newTier,
        points: currentPoints,
      },
      read: false,
      created_at: new Date().toISOString(),
    });

    if (notifError) {
      // Nicht-kritisch: Benachrichtigung ist nicht essentiell
      console.error(
        `Benachrichtigung über Stufenaufstieg konnte nicht erstellt werden: ${notifError.message}`,
      );
    }
  }

  // Cache invalidieren
  await cache.del(`user:points:${userId}`);
  await cache.del(`user:tier:${userId}`);

  return { oldTier, newTier, changed: true };
}

/**
 * Täglicher Cron: Gleicht alle Privilegstufen ab.
 *
 * Durchläuft alle Profile, berechnet die korrekte Stufe
 * und korrigiert Abweichungen. Nützlich als Sicherheitsnetz,
 * falls einzelne Aktualisierungen fehlgeschlagen sind.
 *
 * @returns Anzahl der korrigierten Profile
 */
export async function reconcileAllTiers(): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Alle Profile laden (mit Paginierung für große Datenbestände)
  let correctedCount = 0;
  let offset = 0;
  const pageSize = 1000;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, reputation_points, privilege_tier')
      .range(offset, offset + pageSize - 1)
      .order('id');

    if (error) {
      throw new Error(`Profile konnten nicht geladen werden: ${error.message}`);
    }

    const rows = (profiles ?? []) as AnyRow[];
    if (rows.length === 0) break;

    for (const row of rows) {
      const currentTier = (row.privilege_tier ?? 0) as PrivilegeTier;
      const correctTier = computeTier(row.reputation_points ?? 0);

      if (currentTier !== correctTier) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            privilege_tier: correctTier,
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.id);

        if (!updateError) {
          correctedCount++;

          // Bei Aufstieg: Benachrichtigung
          if (correctTier > currentTier) {
            await supabase.from('notifications').insert({
              user_id: row.id,
              type: 'tier_up',
              payload: {
                old_tier: currentTier,
                new_tier: correctTier,
                points: row.reputation_points,
                source: 'reconciliation',
              },
              read: false,
              created_at: new Date().toISOString(),
            });
          }

          // Cache invalidieren
          await cache.del(`user:tier:${row.id}`);
          await cache.del(`user:points:${row.id}`);
        }
      }
    }

    // Nächste Seite
    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return correctedCount;
}
