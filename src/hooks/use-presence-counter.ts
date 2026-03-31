'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UsePresenceCounterReturn {
  onlineCount: number;
}

/**
 * Tracks how many users are currently viewing a topic's results
 * using Supabase Realtime Presence.
 * Displays "X Buerger stimmen gerade ab" style counters.
 */
export function usePresenceCounter(topicId: string): UsePresenceCounterReturn {
  const [onlineCount, setOnlineCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const countPresences = useCallback(
    (presenceState: Record<string, unknown[]>) => {
      const count = Object.keys(presenceState).reduce((acc, key) => {
        const entries = presenceState[key];
        return acc + (Array.isArray(entries) ? entries.length : 0);
      }, 0);
      setOnlineCount(count);
    },
    [],
  );

  useEffect(() => {
    if (!topicId) return;

    const supabase = createClient();
    const channelName = `voting-presence:${topicId}`;

    // Generate a simple anonymous user id for this session
    const userId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const channel = supabase.channel(channelName, {
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
  }, [topicId, countPresences]);

  return { onlineCount };
}
