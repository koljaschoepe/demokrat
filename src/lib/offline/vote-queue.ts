/**
 * Offline vote queue using IndexedDB.
 * Stores pending votes when offline and syncs them when back online.
 */

const DB_NAME = 'demokrat-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-votes';

export interface PendingVote {
  id: string;
  topicId: string;
  position: 'JA' | 'NEIN' | 'ENTHALTUNG';
  createdAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Queue a vote for later syncing.
 */
export async function queueVote(
  voteData: Omit<PendingVote, 'id' | 'createdAt'>,
): Promise<string> {
  try {
    const db = await openDB();
    const id = `vote-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const vote: PendingVote = {
      ...voteData,
      id,
      createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(vote);
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  } catch {
    // IndexedDB not available; fall through silently
    return '';
  }
}

/**
 * Get all pending votes from the queue.
 */
export async function getPendingVotes(): Promise<PendingVote[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () =>
        resolve((request.result as PendingVote[]) ?? []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

/**
 * Remove a processed vote from the queue.
 */
export async function clearVote(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // IndexedDB not available; fall through silently
  }
}

/**
 * Attempt to sync all pending votes to the server.
 */
export async function syncPendingVotes(): Promise<{
  synced: number;
  failed: number;
}> {
  const votes = await getPendingVotes();
  let synced = 0;
  let failed = 0;

  for (const vote of votes) {
    try {
      const response = await fetch('/api/trpc/votes.cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: vote.topicId,
          position: vote.position,
        }),
      });

      if (response.ok) {
        await clearVote(vote.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}
