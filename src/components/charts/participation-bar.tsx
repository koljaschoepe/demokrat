'use client';

import { cn } from '@/lib/utils';

interface ParticipationBarProps {
  /** Participation percentage 0-100 */
  value: number;
  /** Maximum expected value for relative sizing */
  max?: number;
  /** Label text */
  label?: string;
  /** Show percentage text */
  showPercent?: boolean;
  className?: string;
}

/**
 * Phase 159 — Participation Progress Bar
 *
 * A themed progress bar for showing participation rates
 * with indigo fill and smooth animation.
 */
export function ParticipationBar({
  value,
  max = 100,
  label,
  showPercent = true,
  className,
}: ParticipationBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercent && <span className="font-medium tabular-nums">{percent}%</span>}
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Beteiligung'}
      >
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
