/**
 * Phase 146 -- Enhanced sync service for Meilisearch.
 *
 * Provides incremental sync for both topics and comments,
 * plus a full reindex helper for rebuilding an entire index from scratch.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import { meilisearchAdmin } from './client';
import { TOPICS_INDEX, COMMENTS_INDEX } from './index-config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

const TOPICS_LAST_SYNC_KEY = 'meilisearch:topics:last_sync';
const COMMENTS_LAST_SYNC_KEY = 'meilisearch:comments:last_sync';

const BATCH_SIZE = 500;

// ─── Topic Document ────────────────────────────────────────────────

interface TopicDocument {
  id: string;
  title: string;
  description: string;
  summary: string | null;
  category: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
  vote_count: number;
  comment_count: number;
  closes_at: string | null;
}

// ─── Comment Document ──────────────────────────────────────────────

interface CommentDocument {
  id: string;
  content: string;
  topic_id: string;
  user_id: string;
  position: string | null;
  is_flagged: boolean;
  created_at: string;
  bridging_score: number | null;
  upvote_count: number;
}

// ─── Helper: Index a batch of documents ────────────────────────────

async function indexBatch(indexName: string, documents: unknown[]): Promise<void> {
  if (documents.length === 0) return;

  const response = await meilisearchAdmin(
    'POST',
    `/indexes/${indexName}/documents`,
    documents,
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Meilisearch indexing failed for "${indexName}": ${response.status} ${response.statusText} - ${errorText}`,
    );
  }
}

// ─── Topics: Incremental Sync ──────────────────────────────────────

/**
 * Incremental sync of topics to Meilisearch.
 * Only syncs topics updated since the last sync timestamp.
 * Uses the new meilisearchAdmin client.
 */
export async function syncTopicsIncremental(): Promise<{ indexed: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const lastSync = await cache.get<string>(TOPICS_LAST_SYNC_KEY);
  const now = new Date().toISOString();

  let query = supabase
    .from('topics')
    .select(
      'id, title, description, summary, category, source, status, created_at, updated_at, vote_count, comment_count, closes_at',
    )
    .in('status', ['active', 'voting_closed', 'pending']);

  if (lastSync) {
    query = query.gte('updated_at', lastSync);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch topics for Meilisearch: ${error.message}`);
  }

  const documents = (data ?? []) as TopicDocument[];

  if (documents.length > 0) {
    await indexBatch(TOPICS_INDEX, documents);
  }

  await cache.set(TOPICS_LAST_SYNC_KEY, now);

  return { indexed: documents.length };
}

// ─── Comments: Incremental Sync ────────────────────────────────────

/**
 * Incremental sync of comments to Meilisearch.
 * Only syncs non-flagged comments from active/voting topics
 * that were created since the last sync timestamp.
 */
export async function syncCommentsIncremental(): Promise<{ indexed: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const lastSync = await cache.get<string>(COMMENTS_LAST_SYNC_KEY);
  const now = new Date().toISOString();

  // Get active/voting topic IDs
  const { data: activeTopics, error: topicsError } = await supabase
    .from('topics')
    .select('id')
    .in('status', ['active', 'voting']);

  if (topicsError) {
    throw new Error(`Failed to fetch active topics: ${topicsError.message}`);
  }

  const activeTopicIds = ((activeTopics ?? []) as AnyRow[]).map(
    (t: AnyRow) => t.id as string,
  );

  if (activeTopicIds.length === 0) {
    await cache.set(COMMENTS_LAST_SYNC_KEY, now);
    return { indexed: 0 };
  }

  // Fetch non-flagged comments from active topics
  let query = supabase
    .from('comments')
    .select(
      'id, content, topic_id, user_id, position, is_flagged, created_at, bridging_score, upvote_count',
    )
    .in('topic_id', activeTopicIds)
    .eq('is_flagged', false);

  if (lastSync) {
    query = query.gte('created_at', lastSync);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch comments for Meilisearch: ${error.message}`);
  }

  const documents = (data ?? []) as CommentDocument[];

  if (documents.length > 0) {
    await indexBatch(COMMENTS_INDEX, documents);
  }

  await cache.set(COMMENTS_LAST_SYNC_KEY, now);

  return { indexed: documents.length };
}

// ─── Full Reindex ──────────────────────────────────────────────────

/**
 * Full reindex of a given index. Fetches all rows from the database
 * in paginated batches of BATCH_SIZE (500) and sends them to Meilisearch.
 *
 * Warning: This can be slow for large datasets. Use for initial setup
 * or recovery only.
 */
export async function fullReindex(
  indexName: typeof TOPICS_INDEX | typeof COMMENTS_INDEX,
): Promise<{ indexed: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Clear the index first
  const deleteResponse = await meilisearchAdmin(
    'DELETE',
    `/indexes/${indexName}/documents`,
  );

  if (!deleteResponse.ok) {
    const errorText = await deleteResponse.text();
    throw new Error(
      `Failed to clear index "${indexName}": ${deleteResponse.status} ${deleteResponse.statusText} - ${errorText}`,
    );
  }

  let totalIndexed = 0;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let data: AnyRow[] = [];
    let error: AnyRow = null;

    if (indexName === TOPICS_INDEX) {
      const result = await supabase
        .from('topics')
        .select(
          'id, title, description, summary, category, source, status, created_at, updated_at, vote_count, comment_count, closes_at',
        )
        .in('status', ['active', 'voting_closed', 'pending'])
        .order('created_at', { ascending: true })
        .range(offset, offset + BATCH_SIZE - 1);

      data = (result.data ?? []) as AnyRow[];
      error = result.error;
    } else if (indexName === COMMENTS_INDEX) {
      const result = await supabase
        .from('comments')
        .select(
          'id, content, topic_id, user_id, position, is_flagged, created_at, bridging_score, upvote_count',
        )
        .eq('is_flagged', false)
        .order('created_at', { ascending: true })
        .range(offset, offset + BATCH_SIZE - 1);

      data = (result.data ?? []) as AnyRow[];
      error = result.error;
    }

    if (error) {
      throw new Error(
        `Failed to fetch batch for reindex of "${indexName}": ${error.message}`,
      );
    }

    if (data.length > 0) {
      await indexBatch(indexName, data);
      totalIndexed += data.length;
    }

    hasMore = data.length === BATCH_SIZE;
    offset += BATCH_SIZE;
  }

  // Update last sync timestamp
  const syncKey =
    indexName === TOPICS_INDEX ? TOPICS_LAST_SYNC_KEY : COMMENTS_LAST_SYNC_KEY;
  await cache.set(syncKey, new Date().toISOString());

  return { indexed: totalIndexed };
}

// ─── Document Deletion ─────────────────────────────────────────────

/**
 * Removes documents from a Meilisearch index by their IDs.
 */
export async function deleteFromIndex(
  indexName: string,
  documentIds: string[],
): Promise<void> {
  if (documentIds.length === 0) return;

  const response = await meilisearchAdmin(
    'POST',
    `/indexes/${indexName}/documents/delete-batch`,
    documentIds,
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete documents from "${indexName}": ${response.status} ${response.statusText} - ${errorText}`,
    );
  }
}
