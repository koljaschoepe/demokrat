import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

export interface Quest {
  id: string;
  type: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  weekStart: string;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalLevels: 30;
}

export interface SeasonLevel {
  level: number;
  progress: number;
}

// ---------------------------------------------------------------------------
// Wöchentliche Quest-Vorlagen
// ---------------------------------------------------------------------------

const WEEKLY_QUEST_TEMPLATES = [
  { type: 'vote_3', title: '3 Abstimmungen', description: 'Stimme diese Woche bei 3 Themen ab', target: 3, reward: 50 },
  { type: 'comment_2', title: '2 Kommentare', description: 'Schreibe 2 Kommentare diese Woche', target: 2, reward: 30 },
  { type: 'session_5', title: '5 Sessions', description: 'Schließe 5 tägliche Sessions ab', target: 5, reward: 75 },
  { type: 'rate_5', title: '5 Bewertungen', description: 'Bewerte 5 Kommentare', target: 5, reward: 25 },
  { type: 'category_3', title: '3 Kategorien', description: 'Stimme in 3 verschiedenen Kategorien ab', target: 3, reward: 40 },
] as const;

type QuestTemplate = (typeof WEEKLY_QUEST_TEMPLATES)[number];

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

/**
 * Berechnet den Montag der aktuellen Woche (Europe/Berlin) als YYYY-MM-DD.
 */
function getCurrentWeekStart(): string {
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }),
  );
  const dayOfWeek = now.getDay(); // 0 = Sonntag
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  return monday.toISOString().split('T')[0]!;
}

/**
 * Berechnet den Sonntag der aktuellen Woche als YYYY-MM-DD.
 */
function getCurrentWeekEnd(): string {
  const mondayStr = getCurrentWeekStart();
  const monday = new Date(mondayStr + 'T12:00:00Z');
  const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  return sunday.toISOString().split('T')[0]!;
}

/**
 * Wählt n zufällige Elemente aus einem Array (Fisher-Yates-Shuffle).
 */
function pickRandom<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]!);
  }
  return result;
}

/**
 * Berechnet den Fortschritt für einen Quest-Typ anhand der Aktivitäten dieser Woche.
 */
async function getQuestProgress(
  supabase: AnyRow,
  userId: string,
  questType: string,
  weekStart: string,
  weekEnd: string,
): Promise<number> {
  switch (questType) {
    case 'vote_3': {
      const { count } = await supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', weekStart)
        .lte('created_at', weekEnd + 'T23:59:59Z');
      return count ?? 0;
    }
    case 'comment_2': {
      const { count } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', weekStart)
        .lte('created_at', weekEnd + 'T23:59:59Z');
      return count ?? 0;
    }
    case 'session_5': {
      const { count } = await supabase
        .from('daily_activity')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('date', weekStart)
        .lte('date', weekEnd);
      return count ?? 0;
    }
    case 'rate_5': {
      const { count } = await supabase
        .from('comment_ratings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', weekStart)
        .lte('created_at', weekEnd + 'T23:59:59Z');
      return count ?? 0;
    }
    case 'category_3': {
      const { data } = await supabase
        .from('votes')
        .select('topic_id, topics!inner(category)')
        .eq('user_id', userId)
        .gte('created_at', weekStart)
        .lte('created_at', weekEnd + 'T23:59:59Z');

      if (!data) return 0;
      const categories = new Set(
        (data as AnyRow[]).map((r: AnyRow) => r.topics?.category).filter(Boolean),
      );
      return categories.size;
    }
    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Öffentliche API
// ---------------------------------------------------------------------------

/**
 * Generiert 3 zufällige Quests für die aktuelle Woche.
 * Wenn bereits Quests für die Woche existieren, werden diese zurückgegeben.
 */
export async function generateWeeklyQuests(userId: string): Promise<Quest[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const weekStart = getCurrentWeekStart();

  // Prüfe ob bereits Quests für diese Woche existieren
  const { data: existing } = await supabase
    .from('user_quests')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart);

  if (existing && (existing as AnyRow[]).length > 0) {
    return (existing as AnyRow[]).map((row: AnyRow) => ({
      id: row.id as string,
      type: row.quest_type as string,
      title: row.title as string,
      description: row.description as string,
      progress: (row.progress as number) ?? 0,
      target: row.target as number,
      reward: row.reward as number,
      completed: (row.completed as boolean) ?? false,
      weekStart: row.week_start as string,
    }));
  }

  // 3 zufällige Quests auswählen
  const selected = pickRandom(WEEKLY_QUEST_TEMPLATES, 3);

  const questRows = selected.map((template: QuestTemplate) => ({
    user_id: userId,
    quest_type: template.type,
    title: template.title,
    description: template.description,
    target: template.target,
    reward: template.reward,
    progress: 0,
    completed: false,
    week_start: weekStart,
    created_at: new Date().toISOString(),
  }));

  const { data: inserted, error } = await supabase
    .from('user_quests')
    .insert(questRows)
    .select();

  if (error) {
    // Fallback: Quests als In-Memory-Objekte zurückgeben
    return selected.map((template: QuestTemplate, i: number) => ({
      id: `temp_${i}`,
      type: template.type,
      title: template.title,
      description: template.description,
      progress: 0,
      target: template.target,
      reward: template.reward,
      completed: false,
      weekStart,
    }));
  }

  return (inserted as AnyRow[]).map((row: AnyRow) => ({
    id: row.id as string,
    type: row.quest_type as string,
    title: row.title as string,
    description: row.description as string,
    progress: (row.progress as number) ?? 0,
    target: row.target as number,
    reward: row.reward as number,
    completed: (row.completed as boolean) ?? false,
    weekStart: row.week_start as string,
  }));
}

/**
 * Gibt die aktiven Quests der aktuellen Woche mit aktuellem Fortschritt zurück.
 */
export async function getActiveQuests(userId: string): Promise<Quest[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const weekStart = getCurrentWeekStart();
  const weekEnd = getCurrentWeekEnd();

  const { data } = await supabase
    .from('user_quests')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart);

  if (!data || (data as AnyRow[]).length === 0) {
    // Noch keine Quests generiert → generieren
    return generateWeeklyQuests(userId);
  }

  // Fortschritt aktualisieren
  const quests: Quest[] = [];

  for (const row of data as AnyRow[]) {
    const progress = row.completed
      ? row.target as number
      : await getQuestProgress(supabase, userId, row.quest_type as string, weekStart, weekEnd);

    quests.push({
      id: row.id as string,
      type: row.quest_type as string,
      title: row.title as string,
      description: row.description as string,
      progress: Math.min(progress, row.target as number),
      target: row.target as number,
      reward: row.reward as number,
      completed: (row.completed as boolean) || progress >= (row.target as number),
      weekStart: row.week_start as string,
    });
  }

  return quests;
}

/**
 * Prüft und markiert abgeschlossene Quests. Gibt die IDs der neu abgeschlossenen zurück.
 */
export async function checkQuestCompletion(userId: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const weekStart = getCurrentWeekStart();
  const weekEnd = getCurrentWeekEnd();

  const { data } = await supabase
    .from('user_quests')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .eq('completed', false);

  if (!data) return [];

  const completed: string[] = [];

  for (const row of data as AnyRow[]) {
    const progress = await getQuestProgress(
      supabase,
      userId,
      row.quest_type as string,
      weekStart,
      weekEnd,
    );

    if (progress >= (row.target as number)) {
      await supabase
        .from('user_quests')
        .update({
          completed: true,
          progress: row.target as number,
          completed_at: new Date().toISOString(),
        })
        .eq('id', row.id);

      completed.push(row.id as string);
    } else {
      // Fortschritt aktualisieren
      await supabase
        .from('user_quests')
        .update({ progress })
        .eq('id', row.id);
    }
  }

  return completed;
}

// ---------------------------------------------------------------------------
// Saison-System
// ---------------------------------------------------------------------------

/**
 * Berechnet das Saison-Level und den Fortschritt basierend auf Saison-Punkten.
 *
 * Jedes Level benötigt progressiv mehr Punkte: Level N erfordert N * 50 Punkte.
 * Level 1: 50 Punkte, Level 2: 100 Punkte, Level 3: 150 Punkte, etc.
 */
export function computeSeasonLevel(seasonPoints: number): SeasonLevel {
  let remaining = seasonPoints;
  let level = 0;

  while (level < 30) {
    const pointsForNext = (level + 1) * 50;
    if (remaining < pointsForNext) {
      // Fortschritt im aktuellen Level als Prozent (0–100)
      const progress = pointsForNext > 0
        ? Math.round((remaining / pointsForNext) * 100)
        : 0;
      return { level, progress };
    }
    remaining -= pointsForNext;
    level++;
  }

  // Max Level 30 erreicht
  return { level: 30, progress: 100 };
}

/**
 * Gibt die aktuelle Saison zurück.
 * Saisons dauern 90 Tage. Die erste Saison begann am 01.01.2026.
 */
export function getCurrentSeason(): Season {
  const seasonStart = new Date('2026-01-01T00:00:00Z');
  const now = new Date();
  const diffMs = now.getTime() - seasonStart.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const seasonIndex = Math.floor(diffDays / 90);

  const start = new Date(seasonStart.getTime() + seasonIndex * 90 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000 - 1);

  const seasonNames = [
    'Frühling der Demokratie',
    'Sommerdebatte',
    'Herbst des Wandels',
    'Winterkonsens',
  ];

  const name = seasonNames[seasonIndex % seasonNames.length]!;

  return {
    id: `season_${seasonIndex + 1}`,
    name,
    startDate: start.toISOString().split('T')[0]!,
    endDate: end.toISOString().split('T')[0]!,
    totalLevels: 30,
  };
}

/**
 * Berechnet die verbleibenden Tage in der aktuellen Saison.
 */
export function getSeasonDaysRemaining(): number {
  const season = getCurrentSeason();
  const end = new Date(season.endDate + 'T23:59:59Z');
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}
