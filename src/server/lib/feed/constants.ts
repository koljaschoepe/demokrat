/**
 * Phase 143 -- Feed Scoring Constants
 *
 * Alle Konstanten sind exportiert fuer die /transparenz/algorithmus Seite.
 */

// ─── Einzelne Konstanten ───────────────────────────────────────────

/** Halbwertszeit fuer chronologischen Decay (Stunden) */
export const HALF_LIFE_HOURS = 48;

/** Boost: Aktives Abstimmungsfenster (+100%) */
export const BOOST_ACTIVE_WINDOW = 1.0;

/** Boost: Kategorie-Uebereinstimmung (+50%) */
export const BOOST_CATEGORY_MATCH = 0.5;

/** Boost: Wahlkreis-Uebereinstimmung (+30%) */
export const BOOST_WAHLKREIS = 0.3;

/** Boost: Engagement-Geschwindigkeit (+20%) */
export const BOOST_ENGAGEMENT_VELOCITY = 0.2;

/** Boost: Sitzungswoche aktiv (+50%) */
export const BOOST_SITZUNGSWOCHE = 0.5;

/** Ziel-Anteil Bundestag-Themen im Feed */
export const BUNDESTAG_RATIO = 0.8;

/** Ziel-Anteil Buerger-Themen im Feed */
export const BUERGER_RATIO = 0.2;

/** Seitengroesse fuer Feed-Paginierung */
export const FEED_PAGE_SIZE = 20;

/** Cache-TTL fuer Feed-Ergebnisse (Sekunden) */
export const FEED_CACHE_TTL = 60;

/** Cache-TTL fuer Trending-Themen (Sekunden) */
export const TRENDING_CACHE_TTL = 300;

/** Anzahl der Trending-Themen */
export const TRENDING_COUNT = 5;

// ─── Aggregiertes Konstanten-Objekt ────────────────────────────────

export const FEED_CONSTANTS = {
  HALF_LIFE_HOURS,
  BOOST_ACTIVE_WINDOW,
  BOOST_CATEGORY_MATCH,
  BOOST_WAHLKREIS,
  BOOST_ENGAGEMENT_VELOCITY,
  BOOST_SITZUNGSWOCHE,
  BUNDESTAG_RATIO,
  BUERGER_RATIO,
  FEED_PAGE_SIZE,
  FEED_CACHE_TTL,
  TRENDING_CACHE_TTL,
  TRENDING_COUNT,
} as const;

export type FeedConstants = typeof FEED_CONSTANTS;

// ─── Boost-Faktoren fuer Transparenz-Seite ─────────────────────────

export interface BoostFactor {
  key: string;
  label: string;
  description: string;
  value: number;
}

/**
 * Alle Boost-Faktoren mit deutschen Beschreibungen.
 * Verwendet auf der /transparenz/algorithmus Seite.
 */
export const BOOST_FACTORS: BoostFactor[] = [
  {
    key: 'ACTIVE_WINDOW',
    label: 'Aktives Abstimmungsfenster',
    description:
      'Themen mit laufender Abstimmung erhalten einen Boost von +100%, damit Nutzer rechtzeitig abstimmen können.',
    value: BOOST_ACTIVE_WINDOW,
  },
  {
    key: 'CATEGORY_MATCH',
    label: 'Kategorie-Übereinstimmung',
    description:
      'Themen aus bevorzugten Kategorien des Nutzers erhalten einen Boost von +50%.',
    value: BOOST_CATEGORY_MATCH,
  },
  {
    key: 'WAHLKREIS',
    label: 'Wahlkreis-Übereinstimmung',
    description:
      'Themen aus dem eigenen Wahlkreis erhalten einen Boost von +30% für lokale Relevanz.',
    value: BOOST_WAHLKREIS,
  },
  {
    key: 'ENGAGEMENT_VELOCITY',
    label: 'Engagement-Geschwindigkeit',
    description:
      'Themen mit hoher aktueller Aktivität (Stimmen und Kommentare in den letzten 24 Stunden) erhalten einen Boost von +20%.',
    value: BOOST_ENGAGEMENT_VELOCITY,
  },
  {
    key: 'SITZUNGSWOCHE',
    label: 'Sitzungswoche',
    description:
      'Während einer Sitzungswoche des Bundestags erhalten alle Themen einen Boost von +50%, da politische Entscheidungen anstehen.',
    value: BOOST_SITZUNGSWOCHE,
  },
];
