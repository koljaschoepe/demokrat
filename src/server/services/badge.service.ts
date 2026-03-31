import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ---------------------------------------------------------------------------
// Badge-Definitionen (werden später aus der DB geladen)
// ---------------------------------------------------------------------------

const BADGE_DEFINITIONS = [
  // Beteiligung
  { id: 'first_vote', name: 'Erste Stimme', description: 'Deine erste Abstimmung', icon: 'vote', criteria: { type: 'vote_count', threshold: 1 } },
  { id: 'voter_10', name: 'Aktiver Wähler', description: '10 Abstimmungen abgegeben', icon: 'vote', criteria: { type: 'vote_count', threshold: 10 } },
  { id: 'voter_50', name: 'Stammwähler', description: '50 Abstimmungen abgegeben', icon: 'vote', criteria: { type: 'vote_count', threshold: 50 } },
  { id: 'voter_100', name: 'Demokratie-Veteran', description: '100 Abstimmungen', icon: 'vote', criteria: { type: 'vote_count', threshold: 100 } },
  // Wissen
  { id: 'quiz_master', name: 'Quizmaster', description: '10 Quiz richtig beantwortet', icon: 'brain', criteria: { type: 'quiz_correct', threshold: 10 } },
  { id: 'session_streak_7', name: 'Wochenlerner', description: '7-Tage Session-Streak', icon: 'flame', criteria: { type: 'streak', threshold: 7 } },
  { id: 'session_streak_30', name: 'Monatsstreak', description: '30-Tage Session-Streak', icon: 'flame', criteria: { type: 'streak', threshold: 30 } },
  // Diskussion
  { id: 'first_comment', name: 'Erste Wortmeldung', description: 'Deinen ersten Kommentar geschrieben', icon: 'comment', criteria: { type: 'comment_count', threshold: 1 } },
  { id: 'bridge_builder', name: 'Brückenbauer', description: 'Bridging-Score über 0.8', icon: 'bridge', criteria: { type: 'bridging_score', threshold: 0.8 } },
  // Community
  { id: 'topic_creator', name: 'Themenstarter', description: 'Ein eigenes Thema erstellt', icon: 'lightbulb', criteria: { type: 'topic_count', threshold: 1 } },
  { id: 'wahlkreis_pioneer', name: 'Wahlkreis-Pionier', description: 'Erster aktiver Nutzer im Wahlkreis', icon: 'map', criteria: { type: 'wahlkreis_first', threshold: 1 } },
  { id: 'diversity_champion', name: 'Vielfalt-Champion', description: 'In 8+ Kategorien abgestimmt', icon: 'rainbow', criteria: { type: 'category_diversity', threshold: 8 } },
] as const;

export type BadgeDefinition = (typeof BADGE_DEFINITIONS)[number];
export type BadgeCriteriaType = BadgeDefinition['criteria']['type'];

// ---------------------------------------------------------------------------
// Interne Helfer: Nutzer-Statistiken abfragen
// ---------------------------------------------------------------------------

async function getUserVoteCount(supabase: AnyRow, userId: string): Promise<number> {
  const { count } = await supabase
    .from('votes')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count ?? 0;
}

async function getUserQuizCorrect(supabase: AnyRow, userId: string): Promise<number> {
  const { count } = await supabase
    .from('quiz_answers')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_correct', true);
  return count ?? 0;
}

async function getUserCommentCount(supabase: AnyRow, userId: string): Promise<number> {
  const { count } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count ?? 0;
}

async function getUserMaxBridgingScore(supabase: AnyRow, userId: string): Promise<number> {
  const { data } = await supabase
    .from('comments')
    .select('bridging_score')
    .eq('user_id', userId)
    .order('bridging_score', { ascending: false })
    .limit(1);
  return (data as AnyRow[])?.[0]?.bridging_score ?? 0;
}

async function getUserTopicCount(supabase: AnyRow, userId: string): Promise<number> {
  const { count } = await supabase
    .from('topics')
    .select('id', { count: 'exact', head: true })
    .eq('created_by', userId);
  return count ?? 0;
}

async function getUserCategoryCount(supabase: AnyRow, userId: string): Promise<number> {
  const { data } = await supabase
    .from('votes')
    .select('topic_id, topics!inner(category)')
    .eq('user_id', userId);

  if (!data) return 0;
  const categories = new Set((data as AnyRow[]).map((r: AnyRow) => r.topics?.category).filter(Boolean));
  return categories.size;
}

async function getUserStreak(supabase: AnyRow, userId: string): Promise<number> {
  const { data } = await supabase
    .from('user_streaks')
    .select('longest_streak')
    .eq('user_id', userId)
    .single();
  return (data as AnyRow)?.longest_streak ?? 0;
}

async function isWahlkreisFirst(supabase: AnyRow, userId: string): Promise<boolean> {
  // Prüfe, ob der Nutzer der erste aktive Nutzer in seinem Wahlkreis war
  const { data: profile } = await supabase
    .from('profiles')
    .select('wahlkreis_id')
    .eq('id', userId)
    .single();

  const wahlkreisId = (profile as AnyRow)?.wahlkreis_id;
  if (!wahlkreisId) return false;

  const { data: first } = await supabase
    .from('votes')
    .select('user_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1);

  // Vereinfachte Prüfung: Nutzer hat mindestens eine Stimme abgegeben
  // In der vollen Version prüfen wir ob er der erste im Wahlkreis war
  return (first as AnyRow[])?.length > 0;
}

// ---------------------------------------------------------------------------
// Kriterium-Wert für einen Badge-Typ ermitteln
// ---------------------------------------------------------------------------

async function getCriteriaValue(
  supabase: AnyRow,
  userId: string,
  criteriaType: BadgeCriteriaType,
): Promise<number> {
  switch (criteriaType) {
    case 'vote_count':
      return getUserVoteCount(supabase, userId);
    case 'quiz_correct':
      return getUserQuizCorrect(supabase, userId);
    case 'streak':
      return getUserStreak(supabase, userId);
    case 'comment_count':
      return getUserCommentCount(supabase, userId);
    case 'bridging_score':
      return getUserMaxBridgingScore(supabase, userId);
    case 'topic_count':
      return getUserTopicCount(supabase, userId);
    case 'wahlkreis_first': {
      const isFirst = await isWahlkreisFirst(supabase, userId);
      return isFirst ? 1 : 0;
    }
    case 'category_diversity':
      return getUserCategoryCount(supabase, userId);
    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Öffentliche API
// ---------------------------------------------------------------------------

/**
 * Prüft alle Badge-Kriterien gegen die Nutzer-Statistiken.
 * Vergibt neue Badges und gibt die IDs der neu vergebenen Badges zurück.
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Bereits verdiente Badges laden
  const { data: existingBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  const earnedIds = new Set(
    ((existingBadges ?? []) as AnyRow[]).map((b: AnyRow) => b.badge_id as string),
  );

  const newlyAwarded: string[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    // Bereits verdient → überspringen
    if (earnedIds.has(badge.id)) continue;

    const value = await getCriteriaValue(supabase, userId, badge.criteria.type);

    if (value >= badge.criteria.threshold) {
      const { error } = await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
        earned_at: new Date().toISOString(),
      });

      if (!error) {
        newlyAwarded.push(badge.id);
      }
    }
  }

  return newlyAwarded;
}

/**
 * Gibt alle verdienten Badges eines Nutzers zurück.
 */
export async function getUserBadges(
  userId: string,
): Promise<Array<{ badge_id: string; name: string; description: string; icon: string; earned_at: string }>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  const rows = (data ?? []) as AnyRow[];

  return rows.map((row: AnyRow) => {
    const def = BADGE_DEFINITIONS.find((b) => b.id === row.badge_id);
    return {
      badge_id: row.badge_id as string,
      name: def?.name ?? row.badge_id,
      description: def?.description ?? '',
      icon: def?.icon ?? 'vote',
      earned_at: row.earned_at as string,
    };
  });
}

/**
 * Gibt den Fortschritt zu allen Badges zurück (verdient und nicht verdient).
 */
export async function getBadgeProgress(
  userId: string,
): Promise<Array<{ badge_id: string; name: string; description: string; icon: string; progress: number; threshold: number; earned: boolean }>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Verdiente Badges laden
  const { data: existingBadges } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId);

  const earnedMap = new Map<string, string>();
  for (const row of (existingBadges ?? []) as AnyRow[]) {
    earnedMap.set(row.badge_id as string, row.earned_at as string);
  }

  const results: Array<{
    badge_id: string;
    name: string;
    description: string;
    icon: string;
    progress: number;
    threshold: number;
    earned: boolean;
  }> = [];

  for (const badge of BADGE_DEFINITIONS) {
    const earned = earnedMap.has(badge.id);
    let progress: number;

    if (earned) {
      progress = badge.criteria.threshold;
    } else {
      progress = await getCriteriaValue(supabase, userId, badge.criteria.type);
    }

    results.push({
      badge_id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      progress: Math.min(progress, badge.criteria.threshold),
      threshold: badge.criteria.threshold,
      earned,
    });
  }

  return results;
}
