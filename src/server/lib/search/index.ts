/**
 * Phase 146 -- Barrel export for search module.
 */

export { meilisearchAdmin, meilisearchFetch, meilisearchSearch } from './client';
export type { SearchParams, SearchResult } from './client';

export {
  TOPICS_INDEX,
  COMMENTS_INDEX,
  INDEXES,
  GERMAN_STOP_WORDS,
  BUNDESTAG_DICTIONARY,
  configureAllIndexes,
} from './index-config';

export {
  syncTopicsIncremental,
  syncCommentsIncremental,
  fullReindex,
  deleteFromIndex,
} from './sync';
