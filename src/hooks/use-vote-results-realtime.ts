'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface VoteBreakdownEntry {
  choice: string;
  count: number;
  percentage: number;
}

interface UseVoteResultsRealtimeReturn {
  totalVotes: number;
  breakdown: VoteBreakdownEntry[];
  isLive: boolean;
  lastUpdated: string | null;
}

/**
 * Subscribes to Supabase Realtime changes on the vote_results table,
 * filtered by topic_id. Falls back to polling via tRPC if realtime fails.
 */
export function useVoteResultsRealtime(
  topicId: string,
): UseVoteResultsRealtimeReturn {
  const [totalVotes, setTotalVotes] = useState(0);
  const [breakdown, setBreakdown] = useState<VoteBreakdownEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // tRPC query for initial data + polling fallback
  const { data: trpcData, refetch } = trpc.votes.results.useQuery(
    { topicId },
    { enabled: !!topicId },
  );

  // Sync tRPC data as initial/fallback values
  useEffect(() => {
    if (trpcData) {
      setTotalVotes(trpcData.totalVotes);
      setBreakdown(trpcData.breakdown);
      setLastUpdated(trpcData.lastUpdated);
    }
  }, [trpcData]);

  const parsePayload = useCallback(
    (record: Record<string, unknown>) => {
      const newTotalVotes =
        typeof record.total_votes === 'number' ? record.total_votes : 0;
      const rawResults = record.results as
        | Record<string, number>
        | undefined;

      if (rawResults && typeof rawResults === 'object') {
        const total = newTotalVotes || 1; // avoid division by zero
        const parsed: VoteBreakdownEntry[] = Object.entries(rawResults).map(
          ([choice, count]) => ({
            choice,
            count: typeof count === 'number' ? count : 0,
            percentage: Math.round(
              ((typeof count === 'number' ? count : 0) / total) * 100,
            ),
          }),
        );
        setBreakdown(parsed);
      }

      setTotalVotes(newTotalVotes);
      setLastUpdated(
        typeof record.last_updated === 'string'
          ? record.last_updated
          : new Date().toISOString(),
      );
    },
    [],
  );

  // Start polling fallback
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(() => {
      void refetch();
    }, 10_000);
  }, [refetch]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!topicId) return;

    const supabase = createClient();
    const channelName = `vote_results:${topicId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vote_results',
          filter: `topic_id=eq.${topicId}`,
        },
        (payload) => {
          parsePayload(payload.new as Record<string, unknown>);
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsLive(true);
          stopPolling();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsLive(false);
          startPolling();
        }
      });

    channelRef.current = channel;

    return () => {
      setIsLive(false);
      stopPolling();
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [topicId, parsePayload, startPolling, stopPolling]);

  return { totalVotes, breakdown, isLive, lastUpdated };
}
