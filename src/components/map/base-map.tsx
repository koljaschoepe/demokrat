'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { loadMapboxGL, isMapboxConfigured } from '@/lib/map/mapbox-loader';
import { MAP_CONFIG } from '@/lib/map/config';
import { cn } from '@/lib/utils';

interface BaseMapProps {
  className?: string;
  onMapReady?: (map: unknown) => void;
  onWahlkreisClick?: (wahlkreisId: number, name: string) => void;
  children?: React.ReactNode;
}

/**
 * Phase 156 — Base Map Component
 *
 * Renders a Mapbox GL map with light/dark mode support.
 * Falls back to a styled placeholder if Mapbox token is not configured.
 * Touch gestures are enabled for mobile pan/zoom.
 */
export function BaseMap({ className, onMapReady, children }: BaseMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<unknown>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  const initMap = useCallback(async () => {
    if (!containerRef.current || !isMapboxConfigured()) return;

    try {
      const mapboxgl = await loadMapboxGL();
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const styleUrl = resolvedTheme === 'dark'
        ? MAP_CONFIG.styles.dark
        : MAP_CONFIG.styles.light;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: styleUrl,
        center: MAP_CONFIG.center,
        zoom: MAP_CONFIG.zoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        attributionControl: false,
        dragRotate: false,
        touchZoomRotate: true,
        touchPitch: false,
      });

      // Compact attribution
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

      // Navigation controls (zoom buttons, hidden on mobile)
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        setIsLoaded(true);
        mapRef.current = map;
        onMapReady?.(map);
      });

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Map konnte nicht geladen werden');
    }
  }, [resolvedTheme, onMapReady]);

  useEffect(() => {
    const cleanup = initMap();
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, [initMap]);

  // Theme change: update map style
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = mapRef.current as any;
    if (!map || !isLoaded) return;

    const styleUrl = resolvedTheme === 'dark'
      ? MAP_CONFIG.styles.dark
      : MAP_CONFIG.styles.light;

    try {
      map.setStyle(styleUrl);
    } catch {
      // Style change may fail during transitions
    }
  }, [resolvedTheme, isLoaded]);

  if (!isMapboxConfigured()) {
    return (
      <div className={cn('relative flex flex-1 items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950', className)}>
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-medium">Karte wird konfiguriert</p>
          <p className="mt-1 text-xs">NEXT_PUBLIC_MAPBOX_TOKEN nicht gesetzt</p>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('relative flex-1', className)}>
      <div
        ref={containerRef}
        className="absolute inset-0"
        role="application"
        aria-label="Demokratie-Karte von Deutschland"
      />
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {children}
    </div>
  );
}

export { type BaseMapProps };
