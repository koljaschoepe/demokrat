import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import { STREAK_MILESTONES, type PointAction } from '@/lib/constants/gamification';
import { awardPoints } from './points.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export interface StreakResult {
  currentStreak: number;
  isNew: boolean;
  milestone?: number;
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen: Datumsberechnung in CET/CEST (Europe/Berlin)
// ---------------------------------------------------------------------------

/**
 * Gibt das heutige Datum in der Zeitzone Europe/Berlin als YYYY-MM-DD zurück.
 */
export function getTodayCET(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
}

/**
 * Gibt das gestrige Datum in der Zeitzone Europe/Berlin als YYYY-MM-DD zurück.
 */
export function getYesterdayCET(): string {
  const now = new Date();
  // Aktuelles Datum in CET ermitteln, dann 1 Tag abziehen
  const berlinDate = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }),
  );
  berlinDate.setDate(berlinDate.getDate() - 1);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(
    // Nutze die Originalzeit minus 24h für korrekte Sommerzeit-Berechnung
    new Date(now.getTime() - 24 * 60 * 60 * 1000),
  );
}

/**
 * Berechnet die Differenz in Tagen zwischen zwei YYYY-MM-DD Strings.
 */
function dayDiff(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T12:00:00Z');
  const b = new Date(dateB + 'T12:00:00Z');
  return Math.round((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Mappt einen Streak-Meilenstein auf die entsprechende PointAction.
 */
function milestoneToAction(days: number): PointAction | null {
  switch (days) {
    case 7:
      return 'STREAK_7';
    case 30:
      return 'STREAK_30';
    case 100:
      return 'STREAK_100';
    case 365:
      return 'STREAK_365';
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Hauptfunktionen
// ---------------------------------------------------------------------------

/**
 * Prüft und aktualisiert den Streak eines Nutzers.
 *
 * Logik:
 * - Letzte Aktivität heute → keine Änderung
 * - Letzte Aktivität gestern → Streak um 1 erhöhen
 * - Letzte Aktivität vorgestern + Schild vorhanden → Schild einsetzen, Streak halten
 * - Sonst → Streak auf 1 zurücksetzen (nicht auf 0, da der Nutzer jetzt aktiv ist)
 */
export async function checkAndUpdateStreak(userId: string): Promise<StreakResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const today = getTodayCET();
  const yesterday = getYesterdayCET();

  // Aktuellen Streak laden
  const { data: streakRow } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  const existing = streakRow as AnyRow;

  // --- Kein bestehender Streak → neuen anlegen ---
  if (!existing) {
    await supabase.from('user_streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
      streak_shields: 0,
    });

    return { currentStreak: 1, isNew: true };
  }

  const lastActive: string = existing.last_active_date;
  const diff = dayDiff(today, lastActive);

  // --- Heute schon aktiv → nichts tun ---
  if (diff === 0) {
    return {
      currentStreak: existing.current_streak,
      isNew: false,
    };
  }

  let newStreak: number;
  let shieldsUsed = false;

  if (diff === 1) {
    // Gestern aktiv → Streak fortsetzen
    newStreak = existing.current_streak + 1;
  } else if (diff === 2 && (existing.streak_shields ?? 0) > 0) {
    // Vorgestern aktiv + Schild vorhanden → Schild einsetzen
    newStreak = existing.current_streak + 1;
    shieldsUsed = true;
  } else {
    // Streak unterbrochen → empathischer Reset auf 1 (nicht 0)
    newStreak = 1;
  }

  const longestStreak = Math.max(existing.longest_streak ?? 0, newStreak);
  const newShields = shieldsUsed
    ? Math.max(0, (existing.streak_shields ?? 0) - 1)
    : existing.streak_shields ?? 0;

  // --- UPSERT Streak ---
  const { error: upsertError } = await supabase
    .from('user_streaks')
    .upsert(
      {
        user_id: userId,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_active_date: today,
        streak_shields: newShields,
      },
      { onConflict: 'user_id' },
    );

  if (upsertError) {
    throw new Error(`Streak konnte nicht aktualisiert werden: ${upsertError.message}`);
  }

  // --- Meilenstein prüfen ---
  let milestone: number | undefined;

  for (const ms of STREAK_MILESTONES) {
    if (newStreak === ms) {
      milestone = ms;
      const action = milestoneToAction(ms);
      if (action) {
        await awardPoints(userId, action, `streak:${ms}`);
      }
      break;
    }
  }

  // Cache invalidieren
  await cache.del(`user:streak:${userId}`);

  return {
    currentStreak: newStreak,
    isNew: newStreak === 1 && diff > 1,
    ...(milestone !== undefined ? { milestone } : {}),
  };
}

/**
 * Täglicher Cron: Setzt abgelaufene Streaks zurück.
 *
 * Findet alle Nutzer, deren last_active_date vor gestern liegt
 * und die keine Streak-Schilder haben, und setzt deren Streak auf 0.
 *
 * @returns Anzahl der zurückgesetzten Streaks
 */
export async function resetExpiredStreaks(): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const yesterday = getYesterdayCET();

  const { data, error } = await supabase
    .from('user_streaks')
    .update({ current_streak: 0 })
    .lt('last_active_date', yesterday)
    .eq('streak_shields', 0)
    .gt('current_streak', 0)
    .select('user_id');

  if (error) {
    throw new Error(`Abgelaufene Streaks konnten nicht zurückgesetzt werden: ${error.message}`);
  }

  return data?.length ?? 0;
}

/**
 * Wöchentlicher Cron: Füllt Streak-Schilder auf.
 *
 * Nutzer mit mindestens 5 aktiven Tagen in den letzten 7 erhalten
 * 1 Schild (Maximum: 1 Schild gleichzeitig).
 *
 * @returns Anzahl der aufgefüllten Schilder
 */
export async function replenishShields(): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const today = getTodayCET();

  // Datum vor 7 Tagen berechnen
  const sevenDaysAgo = new Date(
    new Date(today + 'T12:00:00Z').getTime() - 7 * 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .split('T')[0];

  // Nutzer mit >= 5 aktiven Tagen in den letzten 7 Tagen finden
  const { data: activeUsers, error: queryError } = await supabase
    .from('daily_activity')
    .select('user_id')
    .gte('date', sevenDaysAgo)
    .lte('date', today);

  if (queryError) {
    throw new Error(`Aktive Nutzer konnten nicht abgefragt werden: ${queryError.message}`);
  }

  // Tage pro Nutzer zählen
  const daysByUser = new Map<string, Set<string>>();
  for (const row of (activeUsers ?? []) as AnyRow[]) {
    const uid = row.user_id as string;
    if (!daysByUser.has(uid)) {
      daysByUser.set(uid, new Set());
    }
    daysByUser.get(uid)!.add(row.date as string);
  }

  // Nutzer mit >= 5 aktiven Tagen filtern
  const eligibleUserIds: string[] = [];
  for (const [uid, days] of daysByUser) {
    if (days.size >= 5) {
      eligibleUserIds.push(uid);
    }
  }

  if (eligibleUserIds.length === 0) return 0;

  // Schilder auf 1 setzen (max 1) für berechtigte Nutzer, die noch keins haben
  let updatedCount = 0;

  // Batch-Verarbeitung: Alle berechtigten Nutzer auf einmal aktualisieren
  const { data: updated, error: updateError } = await supabase
    .from('user_streaks')
    .update({ streak_shields: 1 })
    .in('user_id', eligibleUserIds)
    .eq('streak_shields', 0)
    .select('user_id');

  if (updateError) {
    throw new Error(`Streak-Schilder konnten nicht aufgefüllt werden: ${updateError.message}`);
  }

  updatedCount = updated?.length ?? 0;

  return updatedCount;
}
