'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  /** Animation duration in milliseconds. Default: 500 */
  duration?: number;
}

const numberFormatter = new Intl.NumberFormat('de-DE');

/**
 * Odometer-style animated number display.
 * Animates smoothly from the previous value to the new value.
 * Respects prefers-reduced-motion.
 */
export function AnimatedCounter({
  value,
  className,
  duration = 500,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);
  const rafIdRef = useRef<number | null>(null);
  const prefersReducedMotionRef = useRef(false);

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mql.matches;

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const animate = useCallback(
    (from: number, to: number) => {
      // Cancel any running animation
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // Skip animation if reduced motion preferred or no change
      if (prefersReducedMotionRef.current || from === to) {
        setDisplayValue(to);
        return;
      }

      const startTime = performance.now();
      const diff = to - from;

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(from + diff * eased);

        setDisplayValue(current);

        if (progress < 1) {
          rafIdRef.current = requestAnimationFrame(step);
        } else {
          rafIdRef.current = null;
        }
      };

      rafIdRef.current = requestAnimationFrame(step);
    },
    [duration],
  );

  useEffect(() => {
    const previousValue = previousValueRef.current;
    previousValueRef.current = value;

    if (previousValue !== value) {
      animate(previousValue, value);
    }
  }, [value, animate]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <span
      className={cn('tabular-nums', className)}
      aria-live="polite"
      aria-atomic="true"
    >
      {numberFormatter.format(displayValue)}
    </span>
  );
}
