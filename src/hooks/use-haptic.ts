'use client';

import { useCallback } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Hook that provides haptic feedback via the Vibration API.
 * No-op on unsupported devices or when reduced motion is preferred.
 */
export function useHaptic() {
  const reducedMotion = useReducedMotion();

  const vibrate = useCallback(
    (pattern: number | number[] = 10) => {
      if (reducedMotion) return;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    },
    [reducedMotion],
  );

  return { vibrate };
}
