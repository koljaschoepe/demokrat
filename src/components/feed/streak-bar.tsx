'use client';

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakBarProps {
  currentStreak?: number;
  dailyProgress?: number;
  dailyGoal?: number;
}

export function StreakBar({
  currentStreak = 0,
  dailyProgress = 0,
  dailyGoal = 5,
}: StreakBarProps) {
  const progressPercent = dailyGoal > 0 ? Math.min((dailyProgress / dailyGoal) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-card p-3 ring-1 ring-foreground/10">
      <Flame className="size-5 shrink-0 text-primary" />
      <span className="text-sm font-medium text-foreground">
        {currentStreak > 0
          ? `${currentStreak} ${currentStreak === 1 ? 'Tag' : 'Tage'} Streak`
          : 'Starte deinen Streak!'}
      </span>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {dailyProgress}/{dailyGoal}
        </span>
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
