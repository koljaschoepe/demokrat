/**
 * Phase 143 -- Feed Scoring Function
 *
 * Regelbasiert, keine KI.
 * Chronologischer Basis-Score mit 48h Halbwertszeit-Decay, additive Boosts.
 * Formel: baseScore = Math.pow(0.5, ageHours / HALF_LIFE_HOURS) * (1 + boostSum)
 */

import {
  HALF_LIFE_HOURS,
  BOOST_ACTIVE_WINDOW,
  BOOST_CATEGORY_MATCH,
  BOOST_WAHLKREIS,
  BOOST_ENGAGEMENT_VELOCITY,
  BOOST_SITZUNGSWOCHE,
} from './constants';

// ─── Interfaces ─────────────────────────────────────────────────────

export interface FeedTopic {
  id: string;
  title: string;
  source: 'BUNDESTAG' | 'BUERGER';
  category: string;
  status: string;
  vote_count: number;
  comment_count: number;
  closes_at: string | null;
  created_at: string;
  updated_at: string;
  wahlkreis_id: string | null;
  recent_votes_24h?: number;
  recent_comments_24h?: number;
}

export interface UserFeedPrefs {
  categories?: string[];
  wahlkreis_id?: string | null;
}

export interface ScoredTopic extends FeedTopic {
  score: number;
}

// ─── Score Computation ──────────────────────────────────────────────

/**
 * Berechnet den Feed-Score fuer ein einzelnes Thema.
 *
 * Score = chronologischer Decay * (1 + Summe aller zutreffenden Boosts)
 *
 * Alle Boosts sind additiv. Ein Thema kann mehrere Boosts gleichzeitig erhalten.
 */
export function computeFeedScore(
  topic: FeedTopic,
  userPrefs?: UserFeedPrefs,
  isSitzungswoche?: boolean,
): number {
  const now = Date.now();

  // ── Chronologischer Decay ──
  const createdAt = new Date(topic.created_at).getTime();
  const ageHours = Math.max(0, (now - createdAt) / (1000 * 60 * 60));
  const decay = Math.pow(0.5, ageHours / HALF_LIFE_HOURS);

  // ── Additive Boost-Akkumulation ──
  let boostSum = 0;

  // Aktives Abstimmungsfenster: closes_at nicht null und noch nicht abgelaufen
  if (topic.closes_at && new Date(topic.closes_at).getTime() > now) {
    boostSum += BOOST_ACTIVE_WINDOW;
  }

  // Kategorie-Uebereinstimmung
  if (
    userPrefs?.categories &&
    userPrefs.categories.length > 0 &&
    userPrefs.categories.includes(topic.category)
  ) {
    boostSum += BOOST_CATEGORY_MATCH;
  }

  // Wahlkreis-Uebereinstimmung
  if (
    userPrefs?.wahlkreis_id &&
    topic.wahlkreis_id &&
    userPrefs.wahlkreis_id === topic.wahlkreis_id
  ) {
    boostSum += BOOST_WAHLKREIS;
  }

  // Engagement-Geschwindigkeit (Stimmen + Kommentare in letzten 24h / Gesamt)
  const recentActivity =
    (topic.recent_votes_24h ?? 0) + (topic.recent_comments_24h ?? 0);
  const totalActivity = topic.vote_count + topic.comment_count;

  if (totalActivity > 0 && recentActivity / totalActivity > 0.1) {
    boostSum += BOOST_ENGAGEMENT_VELOCITY;
  }

  // Sitzungswoche-Boost
  if (isSitzungswoche) {
    boostSum += BOOST_SITZUNGSWOCHE;
  }

  const boostMultiplier = 1 + boostSum;

  return decay * boostMultiplier;
}

// ─── Batch Scoring ──────────────────────────────────────────────────

/**
 * Bewertet und sortiert eine Liste von Themen nach Score (absteigend).
 */
export function scoreFeedTopics(
  topics: FeedTopic[],
  userPrefs?: UserFeedPrefs,
  isSitzungswoche?: boolean,
): ScoredTopic[] {
  return topics
    .map((topic) => ({
      ...topic,
      score: computeFeedScore(topic, userPrefs, isSitzungswoche),
    }))
    .sort((a, b) => b.score - a.score);
}
