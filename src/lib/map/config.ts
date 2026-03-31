/**
 * Phase 156 — Mapbox Configuration
 */

export const MAP_CONFIG = {
  /** Center of Germany */
  center: [10.4515, 51.1657] as [number, number],
  /** Initial zoom to show all of Germany */
  zoom: 5.5,
  /** Min/max zoom levels */
  minZoom: 4,
  maxZoom: 12,
  /** Mapbox style URLs */
  styles: {
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
  },
  /** Source and layer IDs */
  sourceId: 'wahlkreise-source',
  fillLayerId: 'wahlkreise-fill',
  lineLayerId: 'wahlkreise-line',
  highlightLayerId: 'wahlkreise-highlight',
  pulseLayerId: 'wahlkreise-pulse',
} as const;

/** Indigo intensity scale for Fortschritt-Stufe 1-5 */
export const CHOROPLETH_COLORS: Record<number, string> = {
  0: '#e0e7ff', // no data / default
  1: '#c7d2fe', // indigo-200
  2: '#a5b4fc', // indigo-300
  3: '#818cf8', // indigo-400
  4: '#6366f1', // indigo-500
  5: '#4f46e5', // indigo-600
};

export const CHOROPLETH_STOPS = [
  [0, '#e0e7ff'],
  [1, '#c7d2fe'],
  [2, '#a5b4fc'],
  [3, '#818cf8'],
  [4, '#6366f1'],
  [5, '#4f46e5'],
];
