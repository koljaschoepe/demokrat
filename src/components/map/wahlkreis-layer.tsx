'use client';

import { useEffect, useCallback, useRef } from 'react';
import { loadWahlkreisGeoJSON, enrichGeoJSONWithStats } from '@/lib/map/geojson';
import { MAP_CONFIG, CHOROPLETH_STOPS } from '@/lib/map/config';
import { trpc } from '@/lib/trpc/client';

interface WahlkreisLayerProps {
  /** The mapboxgl.Map instance from BaseMap */
  map: unknown;
  /** Currently highlighted wahlkreis (user's own) */
  highlightWahlkreisId?: number;
  /** Callback when a wahlkreis is clicked */
  onWahlkreisClick?: (wahlkreisId: number, name: string) => void;
}

/**
 * Phase 157 — Wahlkreis Choropleth Layer
 *
 * Renders fill layer with Indigo intensity (Stufe 1-5).
 * Highlights the user's own wahlkreis.
 * Handles tap/click and hover interactions.
 */
export function WahlkreisLayer({ map, highlightWahlkreisId, onWahlkreisClick }: WahlkreisLayerProps) {
  const layersAddedRef = useRef(false);

  // Fetch all wahlkreis stats for coloring
  const { data: topWahlkreise } = trpc.map.allStats.useQuery(undefined, {
    staleTime: 600_000, // 10 min
  });

  const addLayers = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = map as any;
    if (!m || layersAddedRef.current) return;

    try {
      const geojson = await loadWahlkreisGeoJSON();

      // Build stats map from tRPC data
      const statsMap = new Map<number, number>();
      if (topWahlkreise) {
        for (const wk of topWahlkreise) {
          statsMap.set(wk.wahlkreis_id, wk.fortschritt_stufe);
        }
      }

      const enriched = enrichGeoJSONWithStats(geojson, statsMap);

      // Wait for style to be loaded
      if (!m.isStyleLoaded()) {
        await new Promise<void>((resolve) => m.once('style.load', resolve));
      }

      // Remove existing layers/source if they exist (e.g. after theme change)
      if (m.getLayer(MAP_CONFIG.highlightLayerId)) m.removeLayer(MAP_CONFIG.highlightLayerId);
      if (m.getLayer(MAP_CONFIG.lineLayerId)) m.removeLayer(MAP_CONFIG.lineLayerId);
      if (m.getLayer(MAP_CONFIG.fillLayerId)) m.removeLayer(MAP_CONFIG.fillLayerId);
      if (m.getSource(MAP_CONFIG.sourceId)) m.removeSource(MAP_CONFIG.sourceId);

      // Add GeoJSON source
      m.addSource(MAP_CONFIG.sourceId, {
        type: 'geojson',
        data: enriched,
        generateId: true,
      });

      // Fill layer — choropleth by fortschritt_stufe
      m.addLayer({
        id: MAP_CONFIG.fillLayerId,
        type: 'fill',
        source: MAP_CONFIG.sourceId,
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'fortschritt_stufe'], 0],
            ...CHOROPLETH_STOPS.flat(),
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.85,
            0.6,
          ],
        },
      });

      // Border line layer
      m.addLayer({
        id: MAP_CONFIG.lineLayerId,
        type: 'line',
        source: MAP_CONFIG.sourceId,
        paint: {
          'line-color': '#4f46e5',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2,
            0.5,
          ],
          'line-opacity': 0.6,
        },
      });

      // Highlight layer for user's own wahlkreis
      m.addLayer({
        id: MAP_CONFIG.highlightLayerId,
        type: 'line',
        source: MAP_CONFIG.sourceId,
        paint: {
          'line-color': '#4f46e5',
          'line-width': 3,
          'line-dasharray': [2, 1],
        },
        filter: ['==', ['get', 'WKR_NR'], highlightWahlkreisId ?? -1],
      });

      layersAddedRef.current = true;

      // --- Interactions ---

      // Hover state tracking
      let hoveredId: number | null = null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      m.on('mousemove', MAP_CONFIG.fillLayerId, (e: any) => {
        if (e.features && e.features.length > 0) {
          if (hoveredId !== null) {
            m.setFeatureState({ source: MAP_CONFIG.sourceId, id: hoveredId }, { hover: false });
          }
          hoveredId = e.features[0].id;
          m.setFeatureState({ source: MAP_CONFIG.sourceId, id: hoveredId }, { hover: true });
          m.getCanvas().style.cursor = 'pointer';
        }
      });

      m.on('mouseleave', MAP_CONFIG.fillLayerId, () => {
        if (hoveredId !== null) {
          m.setFeatureState({ source: MAP_CONFIG.sourceId, id: hoveredId }, { hover: false });
          hoveredId = null;
        }
        m.getCanvas().style.cursor = '';
      });

      // Click handler
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      m.on('click', MAP_CONFIG.fillLayerId, (e: any) => {
        if (e.features && e.features.length > 0) {
          const props = e.features[0].properties;
          onWahlkreisClick?.(props.WKR_NR, props.WKR_NAME);
        }
      });

    } catch (err) {
      console.error('[map] Failed to add wahlkreis layers:', err);
    }
  }, [map, topWahlkreise, highlightWahlkreisId, onWahlkreisClick]);

  useEffect(() => {
    addLayers();
  }, [addLayers]);

  // Update highlight filter when user's wahlkreis changes
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = map as any;
    if (!m || !layersAddedRef.current) return;

    try {
      m.setFilter(MAP_CONFIG.highlightLayerId, [
        '==',
        ['get', 'WKR_NR'],
        highlightWahlkreisId ?? -1,
      ]);
    } catch {
      // Layer might not exist yet
    }
  }, [map, highlightWahlkreisId]);

  // Re-add layers after style change (theme switch)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = map as any;
    if (!m) return;

    const handleStyleLoad = () => {
      layersAddedRef.current = false;
      addLayers();
    };

    m.on('style.load', handleStyleLoad);
    return () => {
      m.off('style.load', handleStyleLoad);
    };
  }, [map, addLayers]);

  return null; // This is a renderless component that adds layers to the map
}
