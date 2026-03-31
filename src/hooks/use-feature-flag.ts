'use client';

import { trpc } from '@/lib/trpc/client';
import { useAuth } from '@/lib/auth/use-auth';

/**
 * Client-side hook to check if a feature flag is enabled.
 */
export function useFeatureFlag(flagId: string): boolean {
  const { user } = useAuth();
  const { data: flags } = trpc.featureFlags.list.useQuery(undefined, {
    staleTime: 60_000, // 1 min
  });

  if (!flags) return false;
  const flag = flags.find(f => f.id === flagId);
  if (!flag || !flag.enabled) return false;
  if (flag.rolloutPercentage >= 100) return true;
  if (!user?.id) return false;

  // Same deterministic hash as server
  let hash = 0;
  const key = `${flagId}:${user.id}`;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return (Math.abs(hash) % 100) < flag.rolloutPercentage;
}
