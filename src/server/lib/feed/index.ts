/**
 * Phase 143-144 -- Feed Module Barrel Export
 */

export {
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
  FEED_CONSTANTS,
  BOOST_FACTORS,
} from './constants';
export type { FeedConstants, BoostFactor } from './constants';

export { computeFeedScore, scoreFeedTopics } from './score';
export type { FeedTopic, UserFeedPrefs, ScoredTopic } from './score';

export { enforceRatio } from './ratio-enforcer';

export {
  feedCache,
  FEED_TTL,
  FEED_CACHE_KEYS,
  getCachedFeed,
  setCachedFeed,
  getCachedTrending,
  setCachedTrending,
  invalidateFeedCaches,
  getCachedSitzungswoche,
  setCachedSitzungswoche,
} from './cache';
