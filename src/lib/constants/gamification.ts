/**
 * Gamification-Konstanten – Punktwerte, Schwellen, Multiplikatoren.
 * Quelle: PRD v1.0, Abschnitt Gamification.
 */

// Punktwerte pro Aktion
export const POINT_VALUES = {
  // Tägliche Sitzung
  SESSION_BRIEFING: 10, // Tagesbriefing lesen
  SESSION_QUIZ_CORRECT: 15, // Quiz richtig beantwortet
  SESSION_QUIZ_WRONG: 5, // Quiz falsch (Teilnahme-Bonus)
  SESSION_VOTE: 15, // Abstimmung in Sitzung
  SESSION_PERSPECTIVE: 5, // Perspektiven gelesen
  SESSION_COMPLETE: 10, // Alle 5 Schritte abgeschlossen (Bonus)

  // Abstimmungen
  VOTE_CAST: 10, // Stimme abgeben
  VOTE_FIRST_TOPIC: 5, // Erste Stimme in neuer Kategorie

  // Diskussionen
  COMMENT_CREATE: 5, // Kommentar verfassen
  COMMENT_HIGH_BRIDGING: 10, // Hoher Bridging-Score (>0.7)
  COMMENT_RATE: 2, // Kommentar bewerten

  // Community
  TOPIC_CREATE: 15, // Bürger-Thema erstellen
  TOPIC_SUPPORT: 3, // Thema unterstützen
  REPORT_VALID: 5, // Gültige Meldung (bestätigt durch Mod)

  // Streaks
  STREAK_7: 25, // 7-Tage-Streak Meilenstein
  STREAK_30: 100, // 30-Tage-Streak Meilenstein
  STREAK_100: 500, // 100-Tage-Streak Meilenstein
  STREAK_365: 2000, // 365-Tage-Streak Meilenstein
} as const;

export type PointAction = keyof typeof POINT_VALUES;

// Privilegstufen-Schwellen (Spiegel von auth/types.ts)
export const TIER_THRESHOLDS = [0, 50, 200, 1000, 5000] as const;

// Streak-Meilensteine
export const STREAK_MILESTONES = [7, 30, 100, 365] as const;

// Anzahl Schritte in der täglichen Sitzung
export const SESSION_STEPS = 5;

// Punktemultiplikator während Sitzungswochen
export const SITZUNGSWOCHE_MULTIPLIER = 2;
