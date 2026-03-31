'use client';

import { usePresenceCounter } from '@/hooks/use-presence-counter';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';

interface ParticipationCounterProps {
  /** Topic or channel ID for presence tracking */
  channelId: string;
  /** Minimum users before showing counter (hide if below) */
  minUsers?: number;
  /** Whether sitzungswoche is active (amplified display) */
  isSitzungswoche?: boolean;
  className?: string;
}

/**
 * Phase 162 — Echtzeit-Teilnahme-Zaehler
 *
 * Shows how many users are currently active on a topic/page.
 * Uses Supabase Realtime Presence with odometer animation.
 * Hides when fewer than minUsers are present.
 * Shows amplified display during Sitzungswoche.
 */
export function ParticipationCounter({
  channelId,
  minUsers = 1,
  isSitzungswoche = false,
  className,
}: ParticipationCounterProps) {
  const { onlineCount } = usePresenceCounter(channelId);

  // Hide if below threshold
  if (onlineCount < minUsers) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5',
        isSitzungswoche
          ? 'bg-indigo-100 dark:bg-indigo-950'
          : 'bg-muted',
        className,
      )}
    >
      {/* Pulsing indigo dot */}
      <span className="relative flex size-2.5">
        <span
          className={cn(
            'absolute inline-flex size-full animate-ping rounded-full opacity-75',
            isSitzungswoche ? 'bg-indigo-500' : 'bg-indigo-400',
          )}
        />
        <span
          className={cn(
            'relative inline-flex size-2.5 rounded-full',
            isSitzungswoche ? 'bg-indigo-600' : 'bg-indigo-500',
          )}
        />
      </span>

      {/* Counter */}
      <span className="text-sm">
        <AnimatedCounter
          value={onlineCount}
          className={cn(
            'font-semibold',
            isSitzungswoche ? 'text-indigo-700 dark:text-indigo-300' : 'text-foreground',
          )}
          duration={400}
        />
        <span className="ml-1 text-muted-foreground">
          {onlineCount === 1 ? 'Bürger aktiv' : 'Bürger aktiv'}
        </span>
      </span>

      {/* Sitzungswoche badge */}
      {isSitzungswoche && (
        <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Live
        </span>
      )}
    </div>
  );
}
