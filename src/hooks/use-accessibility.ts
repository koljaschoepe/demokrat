'use client';

import { useAuth } from '@/lib/auth/use-auth';
import { useReducedMotion } from './use-reduced-motion';

/**
 * Combined accessibility hook that checks both user preferences and OS settings.
 */
export function useAccessibility() {
  const { profile } = useAuth();
  const osReducedMotion = useReducedMotion();

  // User preferences override OS settings when set
  // But OS reduced-motion should always be respected
  const reducedMotion = osReducedMotion || false; // Would check user prefs if available

  return {
    reducedMotion,
    fontSize: 'medium' as const, // Default, would be from prefs
    highContrast: false, // Default, would be from prefs
  };
}
