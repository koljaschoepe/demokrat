'use client';

import { Pencil, Clock, BarChart3, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TopicLifecycleProps {
  topicId: string;
  status: 'draft' | 'pending' | 'active' | 'voting' | 'closed' | 'archived';
  supporterCount: number;
  supporterThreshold?: number;
  isCreator?: boolean;
  hasSupported?: boolean;
  closesAt?: string | null;
  activatedAt?: string | null;
  className?: string;
  onSupport?: () => void;
  onUnsupport?: () => void;
  onPublish?: () => void;
}

const statusConfig = {
  draft: { label: 'Entwurf', variant: 'secondary' as const, step: 0 },
  pending: { label: 'Wartet auf Unterstützung', variant: 'outline' as const, step: 1 },
  active: { label: 'Aktiv — Abstimmung läuft', variant: 'default' as const, step: 2 },
  voting: { label: 'Aktiv — Abstimmung läuft', variant: 'default' as const, step: 2 },
  closed: { label: 'Abgeschlossen', variant: 'destructive' as const, step: 3 },
  archived: { label: 'Archiviert', variant: 'secondary' as const, step: 3 },
} as const;

const lifecycleSteps = [
  { label: 'Entwurf', Icon: Pencil },
  { label: 'Wartend', Icon: Clock },
  { label: 'Aktiv', Icon: BarChart3 },
  { label: 'Abgeschlossen', Icon: CheckCircle2 },
];

function formatDaysRemaining(closesAt: string): string {
  const now = new Date();
  const closes = new Date(closesAt);
  const diffMs = closes.getTime() - now.getTime();
  if (diffMs <= 0) return 'Beendet';
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return `Schließt in ${days} ${days === 1 ? 'Tag' : 'Tagen'}`;
}

export function TopicLifecycle({
  topicId,
  status,
  supporterCount,
  supporterThreshold = 10,
  isCreator = false,
  hasSupported = false,
  closesAt,
  activatedAt,
  className,
  onSupport,
  onUnsupport,
  onPublish,
}: TopicLifecycleProps) {
  const config = statusConfig[status];
  const currentStep = config.step;
  const progressPercent = Math.min((supporterCount / supporterThreshold) * 100, 100);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Status badge + countdown */}
      <div className="flex items-center gap-3">
        <Badge variant={config.variant}>{config.label}</Badge>
        {closesAt && (status === 'voting' || status === 'active') && (
          <span className="text-xs text-muted-foreground">{formatDaysRemaining(closesAt)}</span>
        )}
      </div>

      {/* Lifecycle timeline */}
      <div className="flex items-center gap-0" role="list" aria-label="Themen-Lebenszyklus">
        {lifecycleSteps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const Icon = step.Icon;

          return (
            <div key={step.label} className="flex flex-1 items-center" role="listitem">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted && 'border-indigo-500 bg-indigo-500 text-white',
                    isCurrent && 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
                    !isCompleted && !isCurrent && 'border-gray-300 text-gray-400 dark:border-gray-600',
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <span
                  className={cn(
                    'text-[10px]',
                    isCurrent ? 'font-medium text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < lifecycleSteps.length - 1 && (
                <div
                  className={cn(
                    'mx-1 h-0.5 flex-1',
                    idx < currentStep ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Supporter bar (only for 'pending') */}
      {status === 'pending' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {supporterCount} / {supporterThreshold} Unterstützer
            </span>
            {supporterCount >= supporterThreshold && (
              <span className="font-medium text-green-600 dark:text-green-400">Aktiviert!</span>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Support button */}
          {!isCreator && (
            <div className="mt-1">
              {hasSupported ? (
                <Button variant="outline" size="sm" onClick={onUnsupport} className="w-full">
                  Unterstützt &#10003;
                </Button>
              ) : (
                <Button size="sm" onClick={onSupport} className="w-full">
                  Unterstützen
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Publish button (only for 'draft' + creator) */}
      {status === 'draft' && isCreator && (
        <Button onClick={onPublish} className="w-full">
          Veröffentlichen
        </Button>
      )}
    </div>
  );
}
