'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TopicSummary {
  id: string;
  title: string;
  source: 'BUNDESTAG' | 'BUERGER';
}

interface UseFeedRealtimeReturn {
  newTopicCount: number;
  hasNewTopics: boolean;
  dismissNewTopics: () => void;
}

const BROADCAST_CHANNEL = 'feed:new-topics';

/**
 * Subscribes to a Supabase broadcast channel for new topic announcements.
 * Uses broadcast (not postgres_changes) to avoid noisy subscriptions --
 * the server triggers broadcasts when new topics are published.
 *
 * Returns a count of new topics and a banner-dismiss callback.
 */
export function useFeedRealtime(): UseFeedRealtimeReturn {
  const [newTopics, setNewTopics] = useState<TopicSummary[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const dismissNewTopics = useCallback(() => {
    setNewTopics([]);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(BROADCAST_CHANNEL)
      .on('broadcast', { event: 'new-topic' }, (payload) => {
        const data = payload.payload as Partial<TopicSummary> | undefined;
        if (data && data.id && data.title) {
          const topic: TopicSummary = {
            id: data.id,
            title: data.title,
            source: data.source ?? 'BUERGER',
          };
          setNewTopics((prev) => {
            // Deduplicate by id
            if (prev.some((t) => t.id === topic.id)) return prev;
            return [...prev, topic];
          });
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return {
    newTopicCount: newTopics.length,
    hasNewTopics: newTopics.length > 0,
    dismissNewTopics,
  };
}
