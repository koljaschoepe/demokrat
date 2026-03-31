/**
 * Phase 144 -- Redis Caching Layer fuer Feed
 *
 * Feed-spezifische Cache-Helfer mit dem gemeinsamen Cache aus @/lib/redis/cache.
 * Key-Muster:
 *   feed:anon:{cursor}         - Anonymer Feed (60s TTL)
 *   feed:user:{userId}:{cursor} - Personalisierter Feed (30s TTL)
 *   feed:trending              - Trending-Themen (300s TTL)
 *   feed:sitzungswoche         - Sitzungswoche-Flag (3600s TTL)
 *   topic:meta:{topicId}       - Themen-Metadaten (60s TTL)
 */

import { cache } from '@/lib/redis/cache';
import { FEED_CACHE_TTL, TRENDING_CACHE_TTL } from './constants';

// ─── TTL Konstanten (Sekunden) ─────────────────────────────────────

export const FEED_TTL = {
  ANONYMOUS_FEED: FEED_CACHE_TTL, // 60s
  PERSONAL_FEED: 30,
  TRENDING: TRENDING_CACHE_TTL, // 300s
  SITZUNGSWOCHE: 3600,
  TOPIC_META: 60,
} as const;

// ─── Cache-Key-Muster ──────────────────────────────────────────────

export const FEED_CACHE_KEYS = {
  anonymousFeed: (cursor: number) => `feed:anon:${cursor}`,
  personalFeed: (userId: string, cursor: number) =>
    `feed:user:${userId}:${cursor}`,
  trending: () => 'feed:trending',
  sitzungswoche: () => 'feed:sitzungswoche',
  topicMeta: (topicId: string) => `topic:meta:${topicId}`,
} as const;

// ─── Generische Feed-Cache-Funktionen ──────────────────────────────

/**
 * Liest einen gecachten Feed-Eintrag.
 */
export async function getCachedFeed<T>(key: string): Promise<T | null> {
  return cache.get<T>(key);
}

/**
 * Schreibt einen Feed-Eintrag in den Cache.
 */
export async function setCachedFeed<T>(
  key: string,
  data: T,
  ttl: number,
): Promise<void> {
  await cache.set(key, data, ttl);
}

/**
 * Liest gecachte Trending-Themen.
 */
export async function getCachedTrending<T>(): Promise<T | null> {
  return cache.get<T>(FEED_CACHE_KEYS.trending());
}

/**
 * Schreibt Trending-Themen in den Cache.
 */
export async function setCachedTrending<T>(data: T): Promise<void> {
  await cache.set(FEED_CACHE_KEYS.trending(), data, FEED_TTL.TRENDING);
}

/**
 * Invalidiert Feed-Caches.
 * Da Upstash keine Pattern-basierte Loeschung unterstuetzt,
 * werden die ersten Seiten-Keys explizit geloescht.
 */
export async function invalidateFeedCaches(): Promise<void> {
  const deletePromises: Promise<void>[] = [];
  // Loesche die ersten 10 Seiten des anonymen Feeds
  for (let cursor = 0; cursor < 10; cursor++) {
    deletePromises.push(cache.del(FEED_CACHE_KEYS.anonymousFeed(cursor)));
  }
  // Loesche auch den Trending-Cache
  deletePromises.push(cache.del(FEED_CACHE_KEYS.trending()));
  await Promise.all(deletePromises);
}

/**
 * Liest den gecachten Sitzungswoche-Status.
 */
export async function getCachedSitzungswoche(): Promise<boolean | null> {
  return cache.get<boolean>(FEED_CACHE_KEYS.sitzungswoche());
}

/**
 * Schreibt den Sitzungswoche-Status in den Cache.
 */
export async function setCachedSitzungswoche(active: boolean): Promise<void> {
  await cache.set(FEED_CACHE_KEYS.sitzungswoche(), active, FEED_TTL.SITZUNGSWOCHE);
}

// ─── feedCache Objekt (Kompatibilitaet) ────────────────────────────

export const feedCache = {
  // ── Anonymer Feed ──

  async getAnonymousFeed<T>(cursor: number): Promise<T | null> {
    return getCachedFeed<T>(FEED_CACHE_KEYS.anonymousFeed(cursor));
  },

  async setAnonymousFeed<T>(cursor: number, data: T): Promise<void> {
    await setCachedFeed(
      FEED_CACHE_KEYS.anonymousFeed(cursor),
      data,
      FEED_TTL.ANONYMOUS_FEED,
    );
  },

  // ── Personalisierter Feed ──

  async getPersonalFeed<T>(userId: string, cursor: number): Promise<T | null> {
    return getCachedFeed<T>(FEED_CACHE_KEYS.personalFeed(userId, cursor));
  },

  async setPersonalFeed<T>(
    userId: string,
    cursor: number,
    data: T,
  ): Promise<void> {
    await setCachedFeed(
      FEED_CACHE_KEYS.personalFeed(userId, cursor),
      data,
      FEED_TTL.PERSONAL_FEED,
    );
  },

  // ── Trending ──

  async getTrending<T>(): Promise<T | null> {
    return getCachedTrending<T>();
  },

  async setTrending<T>(data: T): Promise<void> {
    await setCachedTrending(data);
  },

  // ── Invalidierung ──

  async invalidateForNewTopic(): Promise<void> {
    await invalidateFeedCaches();
  },

  async invalidateForUser(userId: string): Promise<void> {
    const deletePromises: Promise<void>[] = [];
    for (let cursor = 0; cursor < 10; cursor++) {
      deletePromises.push(
        cache.del(FEED_CACHE_KEYS.personalFeed(userId, cursor)),
      );
    }
    await Promise.all(deletePromises);
  },

  // ── Sitzungswoche Flag ──

  async getSitzungswoche(): Promise<boolean | null> {
    return getCachedSitzungswoche();
  },

  async setSitzungswoche(active: boolean): Promise<void> {
    await setCachedSitzungswoche(active);
  },
};
