import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

/** Centralized rate limit configurations by category */
export const rateLimits = {
  /** General API: 100 requests per minute */
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'rl:api',
  }),
  /** Auth endpoints: 10 per minute (login, register, password reset) */
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'rl:auth',
  }),
  /** Vote casting: 30 per minute */
  vote: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    prefix: 'rl:vote',
  }),
  /** Comment creation: 10 per minute */
  comment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'rl:comment',
  }),
  /** Topic creation: 5 per hour */
  topicCreate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'rl:topic',
  }),
  /** Report submission: 10 per hour */
  report: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'rl:report',
  }),
  /** Search: 60 per minute */
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'rl:search',
  }),
} as const;

export type RateLimitCategory = keyof typeof rateLimits;
