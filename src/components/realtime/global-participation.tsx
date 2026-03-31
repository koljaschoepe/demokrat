'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface GlobalParticipationProps {
  className?: string;
}

/**
 * Phase 162 — Global Participation Counter
 *
 * Shows total active users across the entire platform.
 * Uses a dedicated 'platform:presence' channel.
 */
export function GlobalParticipation({ className }: GlobalParticipationProps) {
  const [count, setCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const countPresences = useCallback(
    (presenceState: Record<string, unknown[]>) => {
      const total = Object.keys(presenceState).reduce((acc, key) => {
        const entries = presenceState[key];
        return acc + (Array.isArray(entries) ? entries.length : 0);
      }, 0);
      setCount(total);
    },
    [],
  );

  useEffect(() => {
    const supabase = createClient();
    const userId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const channel = supabase.channel('platform:presence', {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        countPresences(state as Record<string, unknown[]>);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, joined_at: Date.now() });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [countPresences]);

  if (count === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-indigo-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-indigo-500" />
      </span>
      <AnimatedCounter
        value={count}
        className="font-semibold text-foreground"
        duration={400}
      />
      <span className="text-muted-foreground">
        {count === 1 ? 'Bürger gerade aktiv' : 'Bürger gerade aktiv'}
      </span>
    </div>
  );
}
