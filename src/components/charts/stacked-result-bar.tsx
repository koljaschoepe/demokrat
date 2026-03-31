'use client';

import { cn } from '@/lib/utils';
import { VOTE_CHART_COLORS, VOTE_LABELS } from '@/lib/charts/theme';

interface StackedResultBarProps {
  breakdown: Array<{ choice: string; count: number; percentage: number }>;
  className?: string;
  /** Height of the bar */
  height?: 'sm' | 'md' | 'lg';
  /** Show legend below */
  showLegend?: boolean;
}

const heightMap = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-5',
};

/**
 * Phase 159 — Stacked Horizontal Result Bar
 *
 * Compact visualization of vote breakdown as a single stacked bar.
 * Useful for cards, lists, and compact views.
 */
export function StackedResultBar({
  breakdown,
  className,
  height = 'md',
  showLegend = false,
}: StackedResultBarProps) {
  const sorted = [...breakdown].sort((a, b) => {
    const order = ['ja', 'nein', 'enthaltung', 'nicht_abgegeben'];
    return order.indexOf(a.choice) - order.indexOf(b.choice);
  });

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn('flex w-full overflow-hidden rounded-full', heightMap[height])}
        role="img"
        aria-label="Abstimmungsergebnis"
      >
        {sorted.map((entry) => (
          <div
            key={entry.choice}
            className="transition-all duration-500"
            style={{
              width: `${Math.max(entry.percentage, 0.5)}%`,
              backgroundColor: VOTE_CHART_COLORS[entry.choice] ?? '#6366f1',
            }}
            title={`${VOTE_LABELS[entry.choice] ?? entry.choice}: ${entry.percentage}%`}
          />
        ))}
      </div>
      {showLegend && (
        <div className="flex flex-wrap gap-3 text-xs">
          {sorted
            .filter((e) => e.percentage > 0)
            .map((entry) => (
              <div key={entry.choice} className="flex items-center gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: VOTE_CHART_COLORS[entry.choice] ?? '#6366f1' }}
                />
                <span className="text-muted-foreground">
                  {VOTE_LABELS[entry.choice] ?? entry.choice} {entry.percentage}%
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
