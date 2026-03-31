'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { trpc } from '@/lib/trpc/client';
import { useAuth } from '@/lib/auth/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

interface LatestNotification {
  id: string;
  title: string;
  type: string;
  createdAt: string;
}

interface UseNotificationRealtimeReturn {
  unreadCount: number;
  latestNotification: LatestNotification | null;
}

const POLL_INTERVAL_MS = 30_000;

/**
 * Subscribes to Supabase Realtime postgres_changes on the notifications table,
 * filtered by the current user_id. Falls back to polling via tRPC every 30s
 * if realtime connection fails.
 */
export function useNotificationRealtime(): UseNotificationRealtimeReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id ?? null;

  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] =
    useState<LatestNotification | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // tRPC query for initial data + polling fallback
  const { data: trpcData, refetch } = trpc.notifications.unreadCount.useQuery(
    undefined,
    { enabled: !!userId },
  );

  // Sync tRPC data as initial/fallback values
  useEffect(() => {
    if (typeof trpcData === 'number') {
      setUnreadCount(trpcData);
    } else if (trpcData && typeof trpcData === 'object' && 'count' in trpcData) {
      setUnreadCount((trpcData as { count: number }).count);
    }
  }, [trpcData]);

  // Start polling fallback
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(() => {
      void refetch();
    }, POLL_INTERVAL_MS);
  }, [refetch]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channelName = `notifications:${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const record = payload.new as AnyRow;
          setUnreadCount((prev) => prev + 1);
          const notification: LatestNotification = {
            id: record.id ?? '',
            title: record.title ?? 'Neue Benachrichtigung',
            type: record.type ?? 'default',
            createdAt: record.created_at ?? new Date().toISOString(),
          };
          setLatestNotification(notification);

          // Show toast for new notification
          toast({
            title: notification.title,
            variant: 'default',
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const record = payload.new as AnyRow;
          if (record.read === true) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          stopPolling();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          startPolling();
        }
      });

    channelRef.current = channel;

    return () => {
      stopPolling();
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, toast, startPolling, stopPolling]);

  return { unreadCount, latestNotification };
}
