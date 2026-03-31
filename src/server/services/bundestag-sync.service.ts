import { cache } from '@/lib/redis/cache';
import { syncVorgaenge } from '@/server/integrations/dip/sync';
import { syncAbstimmungen, syncAllNewVotes } from '@/server/integrations/abgeordnetenwatch/sync';
import { syncMdbStammdaten } from '@/server/integrations/abgeordnetenwatch/sync-mdb';

export interface SyncResult {
  dip: { created: number; updated: number } | null;
  abstimmungen: { created: number; updated: number } | null;
  mdb: { created: number; updated: number } | null;
  votes: { synced: number } | null;
  errors: string[];
  duration_ms: number;
}

/**
 * Orchestriert den kompletten Bundestag-Datensync.
 * Aufrufreihenfolge: MdB -> Vorgaenge -> Abstimmungen -> Einzelstimmen
 */
export async function runBundestagSync(): Promise<SyncResult> {
  const start = Date.now();
  const errors: string[] = [];
  let dipResult = null;
  let abstimmungenResult = null;
  let mdbResult = null;
  let votesResult = null;

  // 1. MdB Stammdaten (must be first — votes reference MdBs)
  try {
    mdbResult = await syncMdbStammdaten();
  } catch (error) {
    errors.push(`MdB sync failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 2. DIP Vorgaenge
  try {
    dipResult = await syncVorgaenge();
  } catch (error) {
    errors.push(`DIP sync failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 3. Abstimmungen
  try {
    abstimmungenResult = await syncAbstimmungen();
  } catch (error) {
    errors.push(
      `Abstimmungen sync failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  // 4. Einzelstimmen for new abstimmungen
  if (abstimmungenResult && abstimmungenResult.created > 0) {
    try {
      const count = await syncAllNewVotes();
      votesResult = { synced: count };
    } catch (error) {
      errors.push(
        `Votes sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Store sync run result
  const result: SyncResult = {
    dip: dipResult,
    abstimmungen: abstimmungenResult,
    mdb: mdbResult,
    votes: votesResult,
    errors,
    duration_ms: Date.now() - start,
  };

  await cache.set('bundestag:last_sync_result', result, 86400); // 24h TTL
  await cache.set('bundestag:last_sync_at', new Date().toISOString(), 86400);

  return result;
}
