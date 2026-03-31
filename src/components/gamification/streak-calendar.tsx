'use client';

import { Flame, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCalendarProps {
  currentStreak?: number;
  activeDays?: boolean[]; // [mon, tue, wed, thu, fri, sat, sun]
  shields?: number;
}

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const MOCK_DATA = {
  currentStreak: 5,
  activeDays: [true, true, true, true, true, false, false],
  shields: 1,
};

export function StreakCalendar({
  currentStreak,
  activeDays,
  shields,
}: StreakCalendarProps) {
  const streak = currentStreak ?? MOCK_DATA.currentStreak;
  const days = activeDays ?? MOCK_DATA.activeDays;
  const shieldCount = shields ?? MOCK_DATA.shields;

  return (
    <div className="flex flex-col gap-4">
      {/* Streak count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Flame className="size-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums leading-tight">{streak}</p>
            <p className="text-xs text-muted-foreground">
              {streak === 1 ? 'Tag Streak' : 'Tage Streak'}
            </p>
          </div>
        </div>

        {/* Shield indicator */}
        {shieldCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 dark:bg-indigo-900/30">
            <Shield className="size-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
              {shieldCount}x Schutzschild
            </span>
          </div>
        )}
      </div>

      {/* 7-day calendar */}
      <div className="flex items-center justify-between gap-1">
        {DAY_LABELS.map((label, i) => {
          const isActive = days[i] ?? false;
          return (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">
                {label}
              </span>
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                    : 'bg-muted text-muted-foreground/40',
                )}
              >
                {isActive ? (
                  <Flame className="size-3.5" />
                ) : (
                  <div className="size-2 rounded-full bg-current" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivation text */}
      <p className="text-center text-xs text-muted-foreground">
        {streak >= 7
          ? 'Fantastisch! Eine ganze Woche am Stück!'
          : streak >= 3
            ? 'Weiter so! Du baust deinen Streak auf.'
            : 'Nimm täglich an einer Session teil, um deinen Streak auszubauen.'}
      </p>
    </div>
  );
}
