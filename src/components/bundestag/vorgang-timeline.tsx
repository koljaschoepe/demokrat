'use client';

import { cn } from '@/lib/utils';

interface VorgangTimelineProps {
  beratungsstand: string | null;
}

const STAGES = [
  { label: 'Eingereicht', key: 'eingereicht' },
  { label: '1. Lesung', key: 'erste_lesung' },
  { label: 'Ausschuss', key: 'ausschuss' },
  { label: '2./3. Lesung', key: 'zweite_lesung' },
  { label: 'Verkündet', key: 'verkuendet' },
] as const;

/**
 * Beratungsstand-String → aktiver Stage-Index
 */
function getActiveStage(beratungsstand: string | null): number {
  if (!beratungsstand) return 0;
  const lower = beratungsstand.toLowerCase();
  if (lower.includes('verkündet') || lower.includes('abgeschlossen')) return 4;
  if (lower.includes('2. beratung') || lower.includes('3. beratung')) return 3;
  if (lower.includes('ausschuss') || lower.includes('beschlussempfehlung'))
    return 2;
  if (lower.includes('1. beratung')) return 1;
  return 0;
}

export function VorgangTimeline({ beratungsstand }: VorgangTimelineProps) {
  const activeStage = getActiveStage(beratungsstand);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-[480px] items-center justify-between px-2 py-3">
        {STAGES.map((stage, index) => {
          const isCompleted = index < activeStage;
          const isActive = index === activeStage;
          const isUpcoming = index > activeStage;

          return (
            <div key={stage.key} className="flex flex-1 items-center">
              {/* Dot + Label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground',
                    isActive &&
                      'border-primary bg-primary/10 text-primary ring-2 ring-primary/30',
                    isUpcoming &&
                      'border-muted-foreground/30 bg-muted text-muted-foreground',
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-center text-[0.65rem] leading-tight font-medium sm:text-xs',
                    isCompleted && 'text-primary',
                    isActive && 'text-primary font-semibold',
                    isUpcoming && 'text-muted-foreground',
                  )}
                >
                  {stage.label}
                </span>
              </div>

              {/* Verbindungslinie zwischen Dots */}
              {index < STAGES.length - 1 && (
                <div
                  className={cn(
                    'mx-1 h-0.5 flex-1 rounded-full transition-colors',
                    index < activeStage
                      ? 'bg-primary'
                      : 'bg-muted-foreground/20',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
