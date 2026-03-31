/**
 * Phase 156 — GeoJSON Pipeline
 *
 * Types and loader for wahlkreis boundary data.
 * The actual GeoJSON is loaded from /data/wahlkreise.geojson at runtime.
 */

export interface WahlkreisFeatureProperties {
  WKR_NR: number;
  WKR_NAME: string;
  LAND_NR: number;
  LAND_NAME: string;
}

export interface WahlkreisFeature {
  type: 'Feature';
  properties: WahlkreisFeatureProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface WahlkreisGeoJSON {
  type: 'FeatureCollection';
  features: WahlkreisFeature[];
}

let cachedGeoJSON: WahlkreisGeoJSON | null = null;

/**
 * Loads the wahlkreis GeoJSON from the public directory.
 * Caches the result in memory to avoid repeated fetches.
 */
export async function loadWahlkreisGeoJSON(): Promise<WahlkreisGeoJSON> {
  if (cachedGeoJSON) return cachedGeoJSON;

  const response = await fetch('/data/wahlkreise.geojson');
  if (!response.ok) {
    throw new Error(`Failed to load wahlkreise GeoJSON: ${response.status}`);
  }

  cachedGeoJSON = (await response.json()) as WahlkreisGeoJSON;
  return cachedGeoJSON;
}

/**
 * Adds a `fortschritt_stufe` property to each feature based on stats data.
 * This is used for the choropleth coloring.
 */
export function enrichGeoJSONWithStats(
  geojson: WahlkreisGeoJSON,
  statsMap: Map<number, number>,
): WahlkreisGeoJSON {
  return {
    ...geojson,
    features: geojson.features.map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        fortschritt_stufe: statsMap.get(feature.properties.WKR_NR) ?? 0,
      },
    })),
  };
}
