/**
 * Phase 173 -- Feature Flag Helpers
 */
import { cache } from '@/lib/redis/cache';
import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  updatedAt: string;
}

const CACHE_KEY = 'feature-flags:all';
const CACHE_TTL = 60; // 1 minute

/**
 * Server-side: Check if a feature flag is enabled for a given user.
 * Uses deterministic hashing so each user consistently gets the same result.
 */
export async function isFeatureEnabled(flagId: string, userId?: string): Promise<boolean> {
  const flags = await getAllFlags();
  const flag = flags.find(f => f.id === flagId);
  if (!flag) return false;
  if (!flag.enabled) return false;
  if (flag.rolloutPercentage >= 100) return true;
  if (!userId) return false;

  // Deterministic user assignment based on hash
  const hash = simpleHash(`${flagId}:${userId}`);
  return (hash % 100) < flag.rolloutPercentage;
}

/**
 * Get all feature flags (cached).
 */
export async function getAllFlags(): Promise<FeatureFlag[]> {
  const cached = await cache.get<FeatureFlag[]>(CACHE_KEY);
  if (cached) return cached;

  const admin = createAdminClient() as any;
  const { data } = await admin
    .from('feature_flags')
    .select('id, name, description, enabled, rollout_percentage, updated_at')
    .order('name');

  const flags: FeatureFlag[] = (data ?? []).map((f: AnyRow) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    enabled: f.enabled,
    rolloutPercentage: f.rollout_percentage,
    updatedAt: f.updated_at,
  }));

  await cache.set(CACHE_KEY, flags, CACHE_TTL);
  return flags;
}

/**
 * Invalidate the feature flags cache.
 */
export async function invalidateFlagsCache(): Promise<void> {
  await cache.del(CACHE_KEY);
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
