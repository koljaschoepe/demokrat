/**
 * Phase 146 -- Server-side Meilisearch HTTP client wrapper.
 *
 * Uses direct HTTP fetch (no npm meilisearch package).
 * Provides both admin-level and search-only helpers.
 */

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY;

// ─── Types ──────────────────────────────────────────────────────────

export interface SearchParams {
  q: string;
  filter?: string[];
  sort?: string[];
  limit?: number;
  offset?: number;
  attributesToHighlight?: string[];
  highlightPreTag?: string;
  highlightPostTag?: string;
  matchingStrategy?: 'last' | 'all';
  attributesToRetrieve?: string[];
}

export interface SearchResult<T> {
  hits: (T & { _formatted?: Partial<T>; _matchesPosition?: Record<string, unknown> })[];
  estimatedTotalHits: number;
  processingTimeMs: number;
  query: string;
}

// ─── Admin Client ──────────────────────────────────────────────────

/**
 * Low-level admin fetch wrapper for Meilisearch.
 * Uses the master/admin API key for index management, settings, and document operations.
 */
export async function meilisearchAdmin(
  method: string,
  path: string,
  body?: unknown,
): Promise<Response> {
  if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
    throw new Error('Meilisearch environment variables are not configured.');
  }

  const url = `${MEILISEARCH_HOST}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return response;
}

/**
 * @deprecated Use meilisearchAdmin instead. Kept for backward compatibility.
 */
export async function meilisearchFetch(
  path: string,
  options?: RequestInit,
): Promise<Response> {
  return meilisearchAdmin(
    options?.method ?? 'GET',
    path,
    options?.body ? JSON.parse(options.body as string) : undefined,
  );
}

// ─── Search Client ─────────────────────────────────────────────────

/**
 * Typed search helper -- sends a search request to a Meilisearch index.
 * Uses the admin API key on the server side; for client-side usage,
 * the NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY should be used instead.
 */
export async function meilisearchSearch<T>(
  indexName: string,
  params: SearchParams,
): Promise<SearchResult<T>> {
  const body: Record<string, unknown> = {
    q: params.q,
  };

  if (params.filter && params.filter.length > 0) body.filter = params.filter;
  if (params.sort && params.sort.length > 0) body.sort = params.sort;
  if (params.limit !== undefined) body.limit = params.limit;
  if (params.offset !== undefined) body.offset = params.offset;
  if (params.attributesToHighlight && params.attributesToHighlight.length > 0) {
    body.attributesToHighlight = params.attributesToHighlight;
  }
  if (params.highlightPreTag) body.highlightPreTag = params.highlightPreTag;
  if (params.highlightPostTag) body.highlightPostTag = params.highlightPostTag;
  if (params.matchingStrategy) body.matchingStrategy = params.matchingStrategy;
  if (params.attributesToRetrieve && params.attributesToRetrieve.length > 0) {
    body.attributesToRetrieve = params.attributesToRetrieve;
  }

  const response = await meilisearchAdmin('POST', `/indexes/${indexName}/search`, body);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Meilisearch search failed: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const data = await response.json();

  return {
    hits: data.hits ?? [],
    estimatedTotalHits: data.estimatedTotalHits ?? 0,
    processingTimeMs: data.processingTimeMs ?? 0,
    query: data.query ?? params.q,
  };
}
