'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
}

/**
 * Touch-based pull-to-refresh hook.
 * Only activates when scrolled to top. Configures overscroll-behavior.
 */
export function usePullToRefresh({ onRefresh }: UsePullToRefreshOptions) {
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const reducedMotion = useReducedMotion();

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (isRefreshing) return;
      const container = containerRef.current;
      if (!container || container.scrollTop !== 0) return;

      const touch = e.touches[0];
      if (touch) {
        startYRef.current = touch.clientY;
        pullingRef.current = true;
      }
    },
    [isRefreshing],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pullingRef.current || isRefreshing) return;

      const touch = e.touches[0];
      if (!touch) return;

      const deltaY = touch.clientY - startYRef.current;

      if (deltaY > 0) {
        // Prevent native scroll while pulling
        e.preventDefault();
        const clamped = Math.min(deltaY, MAX_PULL);
        setPullProgress(clamped / PULL_THRESHOLD);
      } else {
        pullingRef.current = false;
        setPullProgress(0);
      }
    },
    [isRefreshing],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;

    if (pullProgress >= 1 && !isRefreshing) {
      setIsRefreshing(true);
      setPullProgress(1);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullProgress(0);
      }
    } else {
      setPullProgress(0);
    }
  }, [pullProgress, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set overscroll-behavior to prevent native pull-to-refresh
    container.style.overscrollBehavior = 'none';

    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    container.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    pullProgress: reducedMotion ? 0 : pullProgress,
    isRefreshing,
    containerRef,
  };
}
