/**
 * Phase 147 -- tRPC Search Router.
 *
 * Provides full-text search and autocomplete suggestions via Meilisearch.
 * Supports searching both topics and comments indexes.
 */

import { z } from 'zod/v4';
import { router, publicProcedure } from '../trpc';
import { meilisearchSearch } from '@/server/lib/search/client';
import { TOPICS_INDEX, COMMENTS_INDEX } from '@/server/lib/search/index-config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ─── Types ──────────────────────────────────────────────────────────

interface SearchHit {
  id: string;
  title: string;
  description?: string;
  source: string;
  category: string;
  status: string;
  voteCount: number;
  commentCount: number;
  _formatted?: Record<string, unknown>;
  _matchesPosition?: Record<string, unknown>;
}

interface CommentHit {
  id: string;
  content: string;
  topicId: string;
  position: string | null;
  bridgingScore: number | null;
  upvoteCount: number;
  _formatted?: Record<string, unknown>;
  _matchesPosition?: Record<string, unknown>;
}

// ─── Raw Meilisearch hit types ─────────────────────────────────────

interface RawTopicHit {
  id: string;
  title: string;
  description: string;
  source: string;
  category: string;
  status: string;
  vote_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  closes_at: string | null;
  _formatted?: Partial<{
    id: string;
    title: string;
    description: string;
    source: string;
    category: string;
    status: string;
    vote_count: number;
    comment_count: number;
    created_at: string;
    updated_at: string;
    closes_at: string | null;
  }>;
  _matchesPosition?: Record<string, unknown>;
}

interface RawCommentHit {
  id: string;
  content: string;
  topic_id: string;
  user_id: string;
  position: string | null;
  created_at: string;
  bridging_score: number | null;
  upvote_count: number;
  _formatted?: Partial<{
    id: string;
    content: string;
    topic_id: string;
    position: string | null;
  }>;
  _matchesPosition?: Record<string, unknown>;
}

// ─── Router ─────────────────────────────────────────────────────────

export const searchRouter = router({
  /**
   * Full-text search across topics or comments with filtering, sorting, and highlighting.
   */
  query: publicProcedure
    .input(
      z.object({
        q: z.string().min(1).max(200),
        index: z.enum(['topics', 'comments']).default('topics'),
        source: z.enum(['BUNDESTAG', 'BUERGER']).optional(),
        category: z.string().optional(),
        status: z.string().optional(),
        sort: z.enum(['relevance', 'newest', 'most_votes']).optional(),
        page: z.number().min(0).default(0),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      const { q, index, source, category, status, sort, page, limit } = input;

      if (index === 'comments') {
        return searchComments(q, input);
      }

      return searchTopics(q, { source, category, status, sort, page, limit });
    }),

  /**
   * Autocomplete suggestions -- fast, lightweight search for typeahead.
   * Returns up to 5 topic titles with IDs.
   */
  suggest: publicProcedure
    .input(
      z.object({
        q: z.string().min(1).max(100),
      }),
    )
    .query(async ({ input }) => {
      const result = await meilisearchSearch<RawTopicHit>(TOPICS_INDEX, {
        q: input.q,
        limit: 5,
        matchingStrategy: 'last',
        attributesToRetrieve: ['id', 'title'],
      });

      const suggestions = result.hits.map((hit) => ({
        id: hit.id,
        title: hit.title,
      }));

      return { suggestions };
    }),
});

// ─── Topic Search Helper ───────────────────────────────────────────

async function searchTopics(
  q: string,
  opts: {
    source?: string;
    category?: string;
    status?: string;
    sort?: string;
    page: number;
    limit: number;
  },
): Promise<{
  hits: SearchHit[];
  totalHits: number;
  processingTimeMs: number;
  query: string;
}> {
  // Build filter array
  const filters: string[] = [];

  if (opts.source) {
    filters.push(`source = "${opts.source}"`);
  }
  if (opts.category) {
    filters.push(`category = "${opts.category}"`);
  }
  if (opts.status) {
    filters.push(`status = "${opts.status}"`);
  }

  // Map sort option to Meilisearch sort
  let sort: string[] | undefined;

  if (opts.sort === 'newest') {
    sort = ['created_at:desc'];
  } else if (opts.sort === 'most_votes') {
    sort = ['vote_count:desc'];
  }
  // 'relevance' or undefined -> no explicit sort (Meilisearch default)

  const offset = opts.page * opts.limit;

  const result = await meilisearchSearch<RawTopicHit>(TOPICS_INDEX, {
    q,
    filter: filters.length > 0 ? filters : undefined,
    sort,
    limit: opts.limit,
    offset,
    attributesToHighlight: ['title', 'description'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
  });

  const hits: SearchHit[] = result.hits.map((hit: AnyRow) => ({
    id: hit.id,
    title: hit.title,
    description: hit.description ?? undefined,
    source: hit.source,
    category: hit.category,
    status: hit.status,
    voteCount: hit.vote_count ?? 0,
    commentCount: hit.comment_count ?? 0,
    _formatted: hit._formatted ?? undefined,
    _matchesPosition: hit._matchesPosition ?? undefined,
  }));

  return {
    hits,
    totalHits: result.estimatedTotalHits,
    processingTimeMs: result.processingTimeMs,
    query: result.query,
  };
}

// ─── Comment Search Helper ─────────────────────────────────────────

async function searchComments(
  q: string,
  opts: {
    page: number;
    limit: number;
  },
): Promise<{
  hits: CommentHit[];
  totalHits: number;
  processingTimeMs: number;
  query: string;
}> {
  const offset = opts.page * opts.limit;

  // Comments are filtered to non-flagged only
  const filters: string[] = ['is_flagged = false'];

  const result = await meilisearchSearch<RawCommentHit>(COMMENTS_INDEX, {
    q,
    filter: filters,
    limit: opts.limit,
    offset,
    attributesToHighlight: ['content'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
  });

  const hits: CommentHit[] = result.hits.map((hit: AnyRow) => ({
    id: hit.id,
    content: hit.content,
    topicId: hit.topic_id,
    position: hit.position ?? null,
    bridgingScore: hit.bridging_score ?? null,
    upvoteCount: hit.upvote_count ?? 0,
    _formatted: hit._formatted ?? undefined,
    _matchesPosition: hit._matchesPosition ?? undefined,
  }));

  return {
    hits,
    totalHits: result.estimatedTotalHits,
    processingTimeMs: result.processingTimeMs,
    query: result.query,
  };
}
