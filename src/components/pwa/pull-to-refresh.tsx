'use client';

import { RefreshCw } from 'lucide-react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  className?: string;
}

/**
 * Pull-to-refresh wrapper component.
 * Shows a pull indicator above content with spring-back animation.
 */
export function PullToRefresh({
  children,
  onRefresh,
  className = '',
}: PullToRefreshProps) {
  const { pullProgress, isRefreshing, containerRef } = usePullToRefresh({
    onRefresh,
  });
  const reducedMotion = useReducedMotion();

  const indicatorHeight = Math.min(pullProgress, 1) * 48;
  const rotation = pullProgress * 360;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto ${className}`}
    >
      {/* Pull indicator */}
      <div
        className={`flex items-center justify-center overflow-hidden ${
          reducedMotion ? '' : 'transition-[height] duration-200 ease-out'
        }`}
        style={{
          height: isRefreshing ? 48 : indicatorHeight,
        }}
        aria-hidden="true"
      >
        <RefreshCw
          className={`h-5 w-5 text-indigo-600 ${
            isRefreshing && !reducedMotion ? 'animate-spin' : ''
          }`}
          style={
            !isRefreshing && !reducedMotion
              ? { transform: `rotate(${rotation}deg)` }
              : undefined
          }
        />
      </div>

      {children}
    </div>
  );
}
