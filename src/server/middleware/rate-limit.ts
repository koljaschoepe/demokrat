import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { TRPCError } from '@trpc/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * 100 Anfragen pro Minute für nicht authentifizierte Nutzer.
 */
export const unauthenticatedLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:unauth',
});

/**
 * 300 Anfragen pro Minute für authentifizierte Nutzer.
 */
export const authenticatedLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(300, '1 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
});

/**
 * Prüft das Rate-Limit für einen Identifier.
 * Wirft einen TRPCError mit TOO_MANY_REQUESTS falls überschritten.
 */
export async function checkRateLimit(
  identifier: string,
  authenticated: boolean,
): Promise<{ limit: number; remaining: number; reset: number }> {
  const limiter = authenticated ? authenticatedLimiter : unauthenticatedLimiter;
  const { success, limit, remaining, reset } =
    await limiter.limit(identifier);

  if (!success) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Zu viele Anfragen. Bitte warte einen Moment.',
    });
  }

  return { limit, remaining, reset };
}
