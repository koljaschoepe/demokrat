'use client';

import { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DAILY_GOALS } from '@/lib/data/daily-goals';

interface StepDailyGoalProps {
  onNext: (dailyGoal: number) => void;
  onBack: () => void;
}

const RECOMMENDED_VALUE = 2;

export function StepDailyGoal({ onNext, onBack }: StepDailyGoalProps) {
  const [selectedGoal, setSelectedGoal] = useState<number>(RECOMMENDED_VALUE);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-heading font-semibold">
          Wie viel Zeit hast du für Demokratie?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Dein tägliches Ziel bestimmt, wie viele Inhalte wir dir zeigen.
        </p>
      </div>

      <div
        className="flex flex-col gap-3"
        role="radiogroup"
        aria-label="Tägliches Zeitbudget"
      >
        {DAILY_GOALS.map((goal) => {
          const isSelected = selectedGoal === goal.value;
          const isRecommended = goal.value === RECOMMENDED_VALUE;

          return (
            <button
              key={goal.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelectedGoal(goal.value)}
              className={cn(
                'flex items-center gap-4 rounded-xl border-2 px-4 py-4 text-left transition-all',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card',
              )}
            >
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                <Clock className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{goal.label}</span>
                  {isRecommended && (
                    <Badge variant="secondary">(empfohlen)</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {goal.description}
                </p>
              </div>
              <div
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/40',
                )}
              >
                {isSelected && (
                  <span className="block size-2 rounded-full bg-primary-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Zurück
        </Button>
        <Button onClick={() => onNext(selectedGoal)} className="flex-1">
          Weiter
        </Button>
      </div>
    </div>
  );
}
