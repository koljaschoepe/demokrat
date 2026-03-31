/**
 * Phase 151 -- Digest Data Gathering Service
 *
 * Sammelt woechentliche Statistiken fuer den Email-Digest eines Nutzers.
 */

import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DigestData {
  votesThisWeek: number;
  newTopicsCount: number;
  streakDays: number;
  topTopics: Array<{ title: string; voteCount: number }>;
  wahlkreisActivity: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Berechnet das Datum vor 7 Tagen in CET als YYYY-MM-DD.
 */
function getWeekAgoCET(): string {
  const now = new Date();
  now.setDate(now.getDate() - 7);
  return now.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

/**
 * Gibt das heutige Datum in CET als YYYY-MM-DD zurueck.
 */
function getTodayCET(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Sammelt alle relevanten Wochen-Statistiken fuer einen Nutzer.
 *
 * Wird vom Weekly-Digest-Cron und ggf. von der Profil-Seite genutzt.
 */
export async function gatherDigestData(userId: string): Promise<DigestData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const weekAgo = getWeekAgoCET();
  const today = getTodayCET();

  // Parallele Abfragen fuer bessere Performance
  const [
    votesResult,
    topTopicsResult,
    newTopicsResult,
    streakResult,
    wahlkreisResult,
  ] = await Promise.all([
    // 1. Abstimmungen des Nutzers diese Woche
    supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${weekAgo}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`),

    // 2. Top-Themen dieser Woche (nach Stimmenzahl)
    supabase
      .from('topics')
      .select('title, vote_count')
      .gte('created_at', `${weekAgo}T00:00:00Z`)
      .order('vote_count', { ascending: false })
      .limit(5),

    // 3. Neue Themen diese Woche (Gesamtzahl)
    supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${weekAgo}T00:00:00Z`),

    // 4. Aktuelle Streak des Nutzers
    supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single(),

    // 5. Wahlkreis-Aktivitaet: Profil laden um Wahlkreis zu ermitteln
    supabase
      .from('profiles')
      .select('wahlkreis_id')
      .eq('id', userId)
      .single(),
  ]);

  // Votes auswerten
  const votesThisWeek = votesResult.count ?? 0;

  // Top-Themen auswerten
  const topTopics = (topTopicsResult.data ?? []).map((row: AnyRow) => ({
    title: row.title as string,
    voteCount: (row.vote_count as number) ?? 0,
  }));

  // Neue Themen zaehlen
  const newTopicsCount = newTopicsResult.count ?? 0;

  // Streak auswerten
  const streakDays = streakResult.data
    ? ((streakResult.data as AnyRow).current_streak as number)
    : 0;

  // Wahlkreis-Aktivitaet ermitteln
  let wahlkreisActivity = 'Kein Wahlkreis zugeordnet';
  const wahlkreisId = wahlkreisResult.data
    ? ((wahlkreisResult.data as AnyRow).wahlkreis_id as string | null)
    : null;

  if (wahlkreisId) {
    const { count: wahlkreisVotes } = await supabase
      .from('votes')
      .select('user_id, profiles!inner(wahlkreis_id)', {
        count: 'exact',
        head: true,
      })
      .eq('profiles.wahlkreis_id', wahlkreisId)
      .gte('created_at', `${weekAgo}T00:00:00Z`);

    const { count: wahlkreisUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('wahlkreis_id', wahlkreisId);

    const votes = wahlkreisVotes ?? 0;
    const users = wahlkreisUsers ?? 0;

    if (users > 0) {
      wahlkreisActivity = `${votes} Abstimmungen von ${users} Nutzern in deinem Wahlkreis`;
    } else {
      wahlkreisActivity = 'Noch keine Aktivität in deinem Wahlkreis';
    }
  }

  return {
    votesThisWeek,
    newTopicsCount,
    streakDays,
    topTopics,
    wahlkreisActivity,
  };
}
