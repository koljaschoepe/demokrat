'use client';

import { useState, useEffect, useCallback } from 'react';
import { syncPendingVotes } from '@/lib/offline/vote-queue';

/**
 * Hook that tracks online/offline status and syncs pending votes when coming back online.
 */
export function useOnlineStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(true);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    // Sync pending votes when coming back online
    void syncPendingVotes();
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    // Set initial state from navigator
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline };
}
