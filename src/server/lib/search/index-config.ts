/**
 * Phase 146 -- Meilisearch index configuration with German-specific settings.
 */

import { meilisearchAdmin } from './client';

// ─── Index Names ───────────────────────────────────────────────────

export const TOPICS_INDEX = 'topics';
export const COMMENTS_INDEX = 'comments';

// ─── Index Definitions ──────────────────────────────────────────────

export const INDEXES = {
  topics: {
    uid: TOPICS_INDEX,
    primaryKey: 'id',
    searchableAttributes: ['title', 'description', 'summary'],
    filterableAttributes: ['category', 'source', 'status'],
    sortableAttributes: ['created_at', 'vote_count', 'comment_count', 'updated_at'],
    displayedAttributes: [
      'id',
      'title',
      'description',
      'source',
      'category',
      'status',
      'vote_count',
      'comment_count',
      'created_at',
      'updated_at',
      'closes_at',
    ],
  },
  comments: {
    uid: COMMENTS_INDEX,
    primaryKey: 'id',
    searchableAttributes: ['content', 'position'],
    filterableAttributes: ['topic_id', 'position', 'is_flagged'],
    sortableAttributes: ['created_at', 'bridging_score', 'upvote_count'],
    displayedAttributes: [
      'id',
      'content',
      'topic_id',
      'user_id',
      'position',
      'created_at',
      'bridging_score',
      'upvote_count',
    ],
  },
} as const;

// ─── Bundestag Dictionary ───────────────────────────────────────────

export const BUNDESTAG_DICTIONARY: string[] = [
  'Bundestag',
  'Gesetzentwurf',
  'Drucksache',
  'Abstimmung',
  'Fraktion',
  'Ausschuss',
  'Plenum',
  'Sitzungswoche',
  'MdB',
  'Abgeordneter',
  'Wahlkreis',
  'Bundesrat',
];

// ─── German Stop Words ──────────────────────────────────────────────

export const GERMAN_STOP_WORDS: string[] = [
  'der',
  'die',
  'das',
  'ein',
  'eine',
  'und',
  'oder',
  'aber',
  'ist',
  'hat',
  'sind',
  'war',
  'wird',
  'werden',
  'haben',
  'sein',
  'nicht',
  'auch',
  'als',
  'von',
  'mit',
  'auf',
  'fuer',
  'an',
  'bei',
  'nach',
  'ueber',
  'aus',
  'zu',
  'zum',
  'zur',
  'in',
  'im',
  'dem',
  'den',
  'des',
  'sich',
  'es',
  'er',
  'sie',
  'wir',
  'ihr',
  'ich',
  'du',
  'so',
  'wie',
  'was',
  'noch',
  'nur',
  'wenn',
  'dass',
  'schon',
  'doch',
  'man',
  'da',
  'kann',
  'mehr',
  'diese',
  'dieser',
  'dieses',
  'einem',
  'einen',
  'einer',
  'eines',
  'vor',
  'bis',
  'durch',
  'gegen',
  'ohne',
  'um',
  'zwischen',
];

// ─── Configure All Indexes ──────────────────────────────────────────

/**
 * Creates and configures BOTH topics and comments indexes with full settings:
 * searchable/filterable/sortable/displayed attributes, typo tolerance,
 * stop words, and Bundestag-specific dictionary.
 */
export async function configureAllIndexes(): Promise<void> {
  for (const [, config] of Object.entries(INDEXES)) {
    // Ensure index exists (Meilisearch returns 202 for already-existing)
    await meilisearchAdmin('POST', '/indexes', {
      uid: config.uid,
      primaryKey: config.primaryKey,
    });

    // Build settings payload
    const settings = {
      searchableAttributes: [...config.searchableAttributes],
      filterableAttributes: [...config.filterableAttributes],
      sortableAttributes: [...config.sortableAttributes],
      displayedAttributes: [...config.displayedAttributes],
      stopWords: GERMAN_STOP_WORDS,
      dictionary: BUNDESTAG_DICTIONARY,
      typoTolerance: {
        enabled: true,
        disableOnAttributes: [],
        disableOnWords: BUNDESTAG_DICTIONARY,
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8,
        },
      },
    };

    const response = await meilisearchAdmin(
      'PATCH',
      `/indexes/${config.uid}/settings`,
      settings,
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to configure index "${config.uid}": ${response.status} ${response.statusText} - ${errorText}`,
      );
    }
  }
}
