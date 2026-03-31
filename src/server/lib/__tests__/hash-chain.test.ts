import { describe, it, expect } from 'vitest';
import { computeEventHash, type HashableEvent } from '../hash-chain';

const baseEvent: HashableEvent = {
  stream_id: 'stream-001',
  event_type: 'vote_cast',
  user_id: 'user-abc-123',
  payload: { topic_id: 'topic-1', position: 'yes' },
  prev_hash: null,
  created_at: '2025-01-15T10:30:00.000Z',
};

describe('computeEventHash', () => {
  it('produces deterministic hash for same input', async () => {
    const hash1 = await computeEventHash(baseEvent);
    const hash2 = await computeEventHash(baseEvent);
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different inputs', async () => {
    const hash1 = await computeEventHash(baseEvent);
    const alteredEvent: HashableEvent = {
      ...baseEvent,
      user_id: 'user-xyz-999',
    };
    const hash2 = await computeEventHash(alteredEvent);
    expect(hash1).not.toBe(hash2);
  });

  it('returns a 64-character hex string (SHA-256)', async () => {
    const hash = await computeEventHash(baseEvent);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('handles prev_hash null for first event in chain', async () => {
    const hash = await computeEventHash(baseEvent);
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');
  });

  it('produces different hash when prev_hash is provided', async () => {
    const hashWithNull = await computeEventHash(baseEvent);
    const eventWithPrev: HashableEvent = {
      ...baseEvent,
      prev_hash: 'abc123def456',
    };
    const hashWithPrev = await computeEventHash(eventWithPrev);
    expect(hashWithNull).not.toBe(hashWithPrev);
  });

  it('sorts payload keys alphabetically (canonical JSON)', async () => {
    const event1: HashableEvent = {
      ...baseEvent,
      payload: { b_key: 'second', a_key: 'first' },
    };
    const event2: HashableEvent = {
      ...baseEvent,
      payload: { a_key: 'first', b_key: 'second' },
    };
    const hash1 = await computeEventHash(event1);
    const hash2 = await computeEventHash(event2);
    expect(hash1).toBe(hash2);
  });

  it('sorts nested object keys alphabetically', async () => {
    const event1: HashableEvent = {
      ...baseEvent,
      payload: { outer: { z_inner: 1, a_inner: 2 } },
    };
    const event2: HashableEvent = {
      ...baseEvent,
      payload: { outer: { a_inner: 2, z_inner: 1 } },
    };
    const hash1 = await computeEventHash(event1);
    const hash2 = await computeEventHash(event2);
    expect(hash1).toBe(hash2);
  });

  it('normalizes date strings to ISO format', async () => {
    const event1: HashableEvent = {
      ...baseEvent,
      created_at: '2025-01-15T10:30:00Z',
    };
    const event2: HashableEvent = {
      ...baseEvent,
      created_at: '2025-01-15T10:30:00.000Z',
    };
    const hash1 = await computeEventHash(event1);
    const hash2 = await computeEventHash(event2);
    expect(hash1).toBe(hash2);
  });

  it('produces different hash for different event types', async () => {
    const hash1 = await computeEventHash(baseEvent);
    const hash2 = await computeEventHash({
      ...baseEvent,
      event_type: 'vote_changed',
    });
    expect(hash1).not.toBe(hash2);
  });
});
