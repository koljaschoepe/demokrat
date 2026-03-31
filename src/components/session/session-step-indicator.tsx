'use client';

import { cn } from '@/lib/utils';

interface SessionStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepProgress: number;
}

export function SessionStepIndicator({
  currentStep,
  totalSteps,
  stepProgress,
}: SessionStepIndicatorProps) {
  return (
    <div className="flex gap-1 px-4 pt-4" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            'relative h-1 flex-1 overflow-hidden rounded-full bg-muted',
          )}
        >
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-300 ease-linear',
              'motion-reduce:transition-none',
            )}
            style={{
              width:
                i < currentStep
                  ? '100%'
                  : i === currentStep
                    ? `${stepProgress}%`
                    : '0%',
            }}
          />
        </div>
      ))}
    </div>
  );
}
