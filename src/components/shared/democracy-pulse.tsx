'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';

interface DemocracyPulseProps {
  variant?: 'compact' | 'expanded';
}

interface PulseComponent {
  label: string;
  value: number;
  max: number;
  color: string;
}

const MOCK_PULSE = {
  score: 67,
  components: [
    { label: 'Beteiligung', value: 22, max: 30 },
    { label: 'Abstimmungen', value: 18, max: 25 },
    { label: 'Bridging', value: 14, max: 20 },
    { label: 'Abdeckung', value: 9, max: 15 },
    { label: 'Vielfalt', value: 4, max: 10 },
  ],
};

const BAR_COLORS = [
  'bg-indigo-600',
  'bg-indigo-500',
  'bg-indigo-400',
  'bg-indigo-300',
  'bg-indigo-200',
];

function getGlowIntensity(score: number): string {
  if (score >= 80) return 'shadow-[0_0_24px_rgba(99,102,241,0.5)]';
  if (score >= 60) return 'shadow-[0_0_16px_rgba(99,102,241,0.35)]';
  if (score >= 40) return 'shadow-[0_0_10px_rgba(99,102,241,0.25)]';
  return 'shadow-[0_0_6px_rgba(99,102,241,0.15)]';
}

function getGlowSize(score: number): string {
  if (score >= 80) return 'size-20';
  if (score >= 60) return 'size-18';
  if (score >= 40) return 'size-16';
  return 'size-14';
}

export function DemocracyPulse({ variant = 'compact' }: DemocracyPulseProps) {
  const [isExpanded, setIsExpanded] = useState(variant === 'expanded');

  const pulseQuery = trpc.gamification.pulsScore.useQuery(undefined, {
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const data = pulseQuery.data ?? MOCK_PULSE;
  const score = typeof data === 'object' && 'score' in data ? (data.score as number) : MOCK_PULSE.score;
  const components: PulseComponent[] =
    typeof data === 'object' && 'components' in data && Array.isArray(data.components)
      ? (data.components as PulseComponent[])
      : MOCK_PULSE.components.map((c, i) => ({ ...c, color: BAR_COLORS[i] ?? 'bg-indigo-500' }));

  const glowIntensity = getGlowIntensity(score);
  const glowSize = getGlowSize(score);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Pulsing circle score */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="group flex flex-col items-center gap-2 focus:outline-none"
        aria-label={`Demokratie-Puls: ${score} von 100. Klicken zum ${isExpanded ? 'Einklappen' : 'Aufklappen'}.`}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-full border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50 to-indigo-100 transition-all dark:from-indigo-950 dark:to-indigo-900',
            glowSize,
            glowIntensity,
            'animate-pulse',
          )}
          style={{ animationDuration: '3s' }}
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold tabular-nums text-indigo-700 dark:text-indigo-300">
              {score}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-wider text-indigo-500/80 dark:text-indigo-400/80">
              Puls
            </span>
          </div>
        </div>

        {variant === 'compact' && (
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground group-hover:text-foreground">
            Demokratie-Puls
            {isExpanded ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </span>
        )}
      </button>

      {/* Expanded: component bars */}
      {isExpanded && (
        <div className="flex w-full max-w-xs flex-col gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2">
          {components.map((comp, i) => {
            const percentage = Math.round((comp.value / comp.max) * 100);
            const barColor = BAR_COLORS[i] ?? 'bg-indigo-500';

            return (
              <div key={comp.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{comp.label}</span>
                  <span className="tabular-nums text-foreground">
                    {comp.value}/{comp.max}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', barColor)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
