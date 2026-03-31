import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './client';

/**
 * Rate limiter for unauthenticated requests.
 * 100 requests per 60 seconds, sliding window.
 */
export const publicRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '60 s'),
  prefix: 'rl:public',
  analytics: true,
});

/**
 * Rate limiter for authenticated requests.
 * 300 requests per 60 seconds, sliding window.
 */
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(300, '60 s'),
  prefix: 'rl:auth',
  analytics: true,
});

/**
 * Check rate limit and return 429 info if exceeded.
 */
export async function checkRateLimit(
  identifier: string,
  authenticated: boolean,
) {
  const limiter = authenticated ? authRateLimit : publicRateLimit;
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    },
  };
}
