'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface VotePulseEvent {
  wahlkreisId: number;
}

/**
 * Phase 157 — Live Vote Pulse
 *
 * Listens to a Supabase broadcast channel for new votes and
 * triggers a pulse animation on the corresponding wahlkreis.
 */
export function useMapVotePulse(
  map: unknown,
  sourceId: string,
): void {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const triggerPulse = useCallback((wahlkreisId: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = map as any;
    if (!m) return;

    try {
      // Find the feature by WKR_NR property
      const features = m.querySourceFeatures(sourceId, {
        filter: ['==', ['get', 'WKR_NR'], wahlkreisId],
      });

      if (features.length > 0) {
        const featureId = features[0].id;
        // Set pulse state
        m.setFeatureState({ source: sourceId, id: featureId }, { pulse: true });

        // Remove pulse after animation
        setTimeout(() => {
          try {
            m.setFeatureState({ source: sourceId, id: featureId }, { pulse: false });
          } catch {
            // Map may have been removed
          }
        }, 1500);
      }
    } catch {
      // Ignore errors during cleanup
    }
  }, [map, sourceId]);

  useEffect(() => {
    if (!map) return;

    const supabase = createClient();
    const channel = supabase
      .channel('map:vote-pulse')
      .on('broadcast', { event: 'vote-pulse' }, (payload) => {
        const data = payload.payload as VotePulseEvent;
        if (data?.wahlkreisId) {
          triggerPulse(data.wahlkreisId);
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
  }, [map, triggerPulse]);
}
