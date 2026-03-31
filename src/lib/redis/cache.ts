import { redis } from './client';

/**
 * Type-safe cache helpers with automatic JSON serialization.
 */
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get<T>(key);
    return value;
  },

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await redis.set(key, value, { ex: ttlSeconds });
    } else {
      await redis.set(key, value);
    }
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },

  async incr(key: string): Promise<number> {
    return await redis.incr(key);
  },

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await redis.expire(key, ttlSeconds);
  },
};
