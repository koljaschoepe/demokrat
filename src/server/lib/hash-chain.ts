/**
 * Phase 068 — Hash Chain Computation for Vote Event Store
 *
 * Provides cryptographic hash chaining for the append-only vote_events table.
 * Uses Web Crypto API (crypto.subtle) for SHA-256 — works in Node.js and Edge.
 */

import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

/** Fields used to compute the canonical hash of a vote event */
export interface HashableEvent {
  stream_id: string;
  event_type: string;
  user_id: string;
  payload: Record<string, unknown>;
  prev_hash: string | null;
  created_at: string; // ISO 8601 UTC
}

/**
 * Creates a canonical JSON string from the event data.
 * - Keys sorted alphabetically
 * - No whitespace
 * - Dates normalized to UTC ISO strings
 */
function canonicalize(event: HashableEvent): string {
  const normalized = {
    created_at: new Date(event.created_at).toISOString(),
    event_type: event.event_type,
    payload: sortObject(event.payload),
    prev_hash: event.prev_hash,
    stream_id: event.stream_id,
    user_id: event.user_id,
  };
  return JSON.stringify(normalized);
}

/**
 * Deep-sorts an object's keys alphabetically for deterministic serialization.
 */
function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      sorted[key] = sortObject(value as Record<string, unknown>);
    } else {
      sorted[key] = value;
    }
  }
  return sorted;
}

/**
 * Computes a SHA-256 hex hash of the canonical event representation.
 * Uses the Web Crypto API (crypto.subtle) for cross-runtime compatibility.
 */
export async function computeEventHash(event: HashableEvent): Promise<string> {
  const canonical = canonicalize(event);
  const encoded = new TextEncoder().encode(canonical);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Retrieves the event_hash of the most recent event in a stream.
 * Returns null for the first event in a stream.
 */
export async function getPreviousHash(
  streamId: string,
): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data, error } = await admin
    .from('vote_events')
    .select('event_hash')
    .eq('stream_id', streamId)
    .order('sequence_number', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return (data as AnyRow).event_hash as string;
}

/** Result of a chain validation check */
export interface ChainValidationResult {
  valid: boolean;
  brokenAt?: number;
}

/**
 * Replays all events in a stream, recomputes each hash, and verifies
 * the chain integrity by checking prev_hash linkage and hash correctness.
 *
 * Returns { valid: true } if the chain is intact, or
 * { valid: false, brokenAt: sequenceNumber } at the first break.
 */
export async function validateChain(
  streamId: string,
): Promise<ChainValidationResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data, error } = await admin
    .from('vote_events')
    .select(
      'sequence_number, stream_id, event_type, user_id, payload, prev_hash, event_hash, created_at',
    )
    .eq('stream_id', streamId)
    .order('sequence_number', { ascending: true });

  if (error) {
    throw new Error(`Failed to load events for chain validation: ${error.message}`);
  }

  const events = (data ?? []) as AnyRow[];

  if (events.length === 0) {
    return { valid: true };
  }

  let expectedPrevHash: string | null = null;

  for (const event of events) {
    // Verify prev_hash linkage
    if (event.prev_hash !== expectedPrevHash) {
      return { valid: false, brokenAt: event.sequence_number as number };
    }

    // Recompute the hash
    const hashable: HashableEvent = {
      stream_id: event.stream_id,
      event_type: event.event_type,
      user_id: event.user_id,
      payload: event.payload as Record<string, unknown>,
      prev_hash: event.prev_hash,
      created_at: event.created_at,
    };

    const recomputed = await computeEventHash(hashable);

    if (recomputed !== event.event_hash) {
      return { valid: false, brokenAt: event.sequence_number as number };
    }

    expectedPrevHash = event.event_hash as string;
  }

  return { valid: true };
}
