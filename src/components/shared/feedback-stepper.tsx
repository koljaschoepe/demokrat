import {
  Vote,
  Building2,
  BarChart3,
  GitCompareArrows,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackStepperProps {
  currentStep?: number;
}

const STEPS = [
  {
    title: 'Bürger stimmen ab',
    description: 'Die Community gibt ihre Stimme zu aktuellen Themen ab.',
    icon: Vote,
  },
  {
    title: 'Bundestag entscheidet',
    description: 'Die Abgeordneten stimmen im Parlament ab.',
    icon: Building2,
  },
  {
    title: 'Ergebnis wird veröffentlicht',
    description: 'Das offizielle Abstimmungsergebnis wird bekannt gegeben.',
    icon: BarChart3,
  },
  {
    title: 'Vergleich & Feedback',
    description: 'Bürger- und Parlamentsergebnis werden verglichen.',
    icon: GitCompareArrows,
  },
];

export function FeedbackStepper({ currentStep = 0 }: FeedbackStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden items-start justify-between md:flex">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isActive = isCompleted || isCurrent;

          return (
            <div key={index} className="flex flex-1 items-start">
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full border-2 transition-colors',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30 bg-background text-muted-foreground'
                  )}
                >
                  <StepIcon className="size-5" />
                </div>
                <span className="mt-2 text-xs font-medium text-muted-foreground">
                  Schritt {index + 1}
                </span>
                <span
                  className={cn(
                    'mt-1 max-w-[140px] text-sm',
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
                <span className="mt-1 max-w-[140px] text-xs text-muted-foreground">
                  {step.description}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mt-5 h-0.5 flex-1',
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-0 md:hidden">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isActive = isCompleted || isCurrent;

          return (
            <div key={index} className="flex gap-4">
              {/* Left column: circle + line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30 bg-background text-muted-foreground'
                  )}
                >
                  <StepIcon className="size-5" />
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 flex-1',
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>

              {/* Right column: text */}
              <div className="pb-8">
                <span className="text-xs font-medium text-muted-foreground">
                  Schritt {index + 1}
                </span>
                <p
                  className={cn(
                    'text-sm',
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
