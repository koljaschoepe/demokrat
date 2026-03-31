import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY;
const LAST_SYNC_KEY = 'meilisearch:last_sync';

interface MeilisearchDocument {
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
}

/**
 * Sends documents to Meilisearch index.
 */
async function indexDocuments(indexName: string, documents: MeilisearchDocument[]): Promise<void> {
  if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY || documents.length === 0) return;

  const response = await fetch(`${MEILISEARCH_HOST}/indexes/${indexName}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
    },
    body: JSON.stringify(documents),
  });

  if (!response.ok) {
    throw new Error(`Meilisearch indexing failed: ${response.status} ${response.statusText}`);
  }
}

/**
 * Configure Meilisearch index settings (filterable, sortable, searchable attributes).
 */
export async function configureIndex(): Promise<void> {
  if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) return;

  const settings = {
    searchableAttributes: ['title', 'description', 'summary'],
    filterableAttributes: ['category', 'source', 'status'],
    sortableAttributes: ['created_at', 'vote_count', 'comment_count'],
  };

  await fetch(`${MEILISEARCH_HOST}/indexes/topics/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MEILISEARCH_API_KEY}`,
    },
    body: JSON.stringify(settings),
  });
}

/**
 * Inkrementeller Sync: Nur Topics die seit dem letzten Sync geändert wurden.
 */
export async function syncTopicsToMeilisearch(): Promise<{ indexed: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const lastSync = await cache.get<string>(LAST_SYNC_KEY);
  const now = new Date().toISOString();

  let query = supabase
    .from('topics')
    .select(
      'id, title, description, summary, category, source, status, created_at, updated_at, vote_count, comment_count',
    )
    .in('status', ['active', 'voting_closed', 'pending']);

  if (lastSync) {
    query = query.gte('updated_at', lastSync);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch topics for Meilisearch: ${error.message}`);
  }

  const documents = (data ?? []) as MeilisearchDocument[];

  if (documents.length > 0) {
    await indexDocuments('topics', documents);
  }

  await cache.set(LAST_SYNC_KEY, now);

  return { indexed: documents.length };
}
