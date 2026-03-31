'use client';

import { Check, Vote, MapPin, Mail, Landmark, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type FeedbackStepStatus = 'completed' | 'current' | 'upcoming';

export interface FeedbackStepData {
  icon: React.ReactNode;
  label: string;
  description: string;
  status: FeedbackStepStatus;
}

interface FeedbackLoopStepsProps {
  /** Override step statuses. If not provided, derives from topicData. */
  steps?: FeedbackStepData[];
  /** Topic-level data to derive statuses automatically */
  topicData?: {
    hasVoted: boolean;
    hasWahlkreisResult: boolean;
    mdbEmailSent: boolean;
    bundestagVoted: boolean;
  };
  /** Compact mode for inline use (no card wrapper) */
  compact?: boolean;
  className?: string;
}

function deriveSteps(data?: FeedbackLoopStepsProps['topicData']): FeedbackStepData[] {
  if (!data) {
    return getDefaultSteps();
  }

  const statuses: FeedbackStepStatus[] = [];

  // Step 1: User voted
  statuses.push(data.hasVoted ? 'completed' : 'current');

  // Step 2: Wahlkreis result
  if (!data.hasVoted) {
    statuses.push('upcoming');
  } else {
    statuses.push(data.hasWahlkreisResult ? 'completed' : 'current');
  }

  // Step 3: MdB email
  if (!data.hasWahlkreisResult) {
    statuses.push('upcoming');
  } else {
    statuses.push(data.mdbEmailSent ? 'completed' : 'current');
  }

  // Step 4: Bundestag voted
  if (!data.mdbEmailSent) {
    statuses.push('upcoming');
  } else {
    statuses.push(data.bundestagVoted ? 'completed' : 'current');
  }

  return [
    {
      icon: <Vote className="size-5" />,
      label: 'Du hast abgestimmt',
      description: 'Deine Stimme wurde gezählt',
      status: statuses[0] ?? 'upcoming',
    },
    {
      icon: <MapPin className="size-5" />,
      label: 'Wahlkreis-Ergebnis',
      description: 'Dein Wahlkreis hat abgestimmt',
      status: statuses[1] ?? 'upcoming',
    },
    {
      icon: <Mail className="size-5" />,
      label: 'Email an MdB',
      description: 'Ergebnis an Abgeordnete/n gesendet',
      status: statuses[2] ?? 'upcoming',
    },
    {
      icon: <Landmark className="size-5" />,
      label: 'Bundestag hat abgestimmt',
      description: 'Vergleich mit dem Bundestag',
      status: statuses[3] ?? 'upcoming',
    },
  ];
}

function getDefaultSteps(): FeedbackStepData[] {
  return deriveSteps({
    hasVoted: true,
    hasWahlkreisResult: false,
    mdbEmailSent: false,
    bundestagVoted: false,
  });
}

function StepCircle({ status, icon }: { status: FeedbackStepStatus; icon: React.ReactNode }) {
  return (
    <div
      className={cn(
        'relative flex size-12 items-center justify-center rounded-full border-2 transition-all duration-500',
        status === 'completed' && 'border-indigo-500 bg-indigo-500 text-white',
        status === 'current' && 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
        status === 'upcoming' && 'border-muted-foreground/30 bg-muted text-muted-foreground',
      )}
    >
      {status === 'completed' ? (
        <Check className="size-5 motion-safe:animate-in motion-safe:zoom-in-50" />
      ) : (
        icon
      )}
      {status === 'current' && (
        <span className="absolute -inset-1 animate-ping rounded-full border-2 border-indigo-500 opacity-20" />
      )}
    </div>
  );
}

function ConnectorLine({ completed }: { completed: boolean }) {
  return (
    <div className="mx-1 hidden h-0.5 flex-1 sm:block">
      <div
        className={cn(
          'h-full rounded-full transition-colors duration-700',
          completed ? 'bg-indigo-500' : 'bg-muted-foreground/20',
        )}
      />
    </div>
  );
}

function ConnectorArrow({ completed }: { completed: boolean }) {
  return (
    <ArrowRight
      className={cn(
        'mx-1 mt-3 size-4 shrink-0 sm:hidden',
        completed ? 'text-indigo-500' : 'text-muted-foreground/30',
      )}
    />
  );
}

/**
 * Phase 163 — Feedback-Loop Visualisierung
 *
 * "Vom Gedanken zum Gesetz" — 4 steps showing the democratic feedback loop:
 * 1. Du hast abgestimmt
 * 2. Wahlkreis-Ergebnis
 * 3. Email an MdB
 * 4. Bundestag hat abgestimmt
 *
 * Animated checkmarks when steps complete.
 */
export function FeedbackLoopSteps({
  steps: customSteps,
  topicData,
  compact = false,
  className,
}: FeedbackLoopStepsProps) {
  const steps = customSteps ?? deriveSteps(topicData);

  const content = (
    <div className={cn('flex flex-col sm:flex-row sm:items-start', className)}>
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-start sm:flex-1 sm:flex-col sm:items-center">
          <div className="flex items-center sm:flex-col">
            <StepCircle status={step.status} icon={step.icon} />
          </div>

          <div className="ml-3 flex-1 sm:ml-0 sm:mt-3 sm:text-center">
            <p
              className={cn(
                'text-sm font-medium',
                step.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              {step.label}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {step.description}
            </p>
          </div>

          {i < steps.length - 1 && (
            <>
              <ConnectorLine completed={step.status === 'completed'} />
              <ConnectorArrow completed={step.status === 'completed'} />
            </>
          )}
        </div>
      ))}
    </div>
  );

  if (compact) return content;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vom Gedanken zum Gesetz</CardTitle>
        <CardDescription>
          So wirkt deine Stimme im demokratischen Prozess
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
