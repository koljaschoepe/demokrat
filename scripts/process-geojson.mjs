#!/usr/bin/env node

/**
 * Phase 156 — GeoJSON Processing Script
 *
 * Downloads Wahlkreis boundaries from Bundeswahlleiter and simplifies them.
 * Output: public/data/wahlkreise.geojson (<2MB target)
 *
 * Usage: node scripts/process-geojson.mjs [input-file]
 *
 * If no input file provided, creates a minimal placeholder.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'wahlkreise.geojson');

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const inputFile = process.argv[2];

if (inputFile) {
  // Process real GeoJSON file
  console.log(`Processing: ${inputFile}`);
  const raw = JSON.parse(readFileSync(inputFile, 'utf-8'));

  // Simplify: reduce coordinate precision to 4 decimal places
  function simplifyCoordinates(coords) {
    if (typeof coords[0] === 'number') {
      return [Math.round(coords[0] * 10000) / 10000, Math.round(coords[1] * 10000) / 10000];
    }
    return coords.map(simplifyCoordinates);
  }

  const simplified = {
    type: 'FeatureCollection',
    features: raw.features.map((f) => ({
      type: 'Feature',
      properties: {
        WKR_NR: f.properties.WKR_NR ?? f.properties.wkr_nr ?? f.properties.WKNR ?? 0,
        WKR_NAME: f.properties.WKR_NAME ?? f.properties.wkr_name ?? f.properties.WKNAME ?? '',
        LAND_NR: f.properties.LAND_NR ?? f.properties.land_nr ?? 0,
        LAND_NAME: f.properties.LAND_NAME ?? f.properties.land_name ?? '',
      },
      geometry: {
        type: f.geometry.type,
        coordinates: simplifyCoordinates(f.geometry.coordinates),
      },
    })),
  };

  const output = JSON.stringify(simplified);
  writeFileSync(OUTPUT_FILE, output);

  const sizeMB = (Buffer.byteLength(output) / 1024 / 1024).toFixed(2);
  console.log(`Output: ${OUTPUT_FILE} (${sizeMB} MB, ${simplified.features.length} features)`);
} else {
  // Create placeholder with sample wahlkreise
  console.log('No input file provided. Creating placeholder GeoJSON...');

  const placeholder = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { WKR_NR: 75, WKR_NAME: 'Berlin-Mitte', LAND_NR: 11, LAND_NAME: 'Berlin' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[13.35, 52.50], [13.42, 52.50], [13.42, 52.54], [13.35, 52.54], [13.35, 52.50]]],
        },
      },
      {
        type: 'Feature',
        properties: { WKR_NR: 76, WKR_NAME: 'Berlin-Pankow', LAND_NR: 11, LAND_NAME: 'Berlin' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[13.38, 52.54], [13.48, 52.54], [13.48, 52.60], [13.38, 52.60], [13.38, 52.54]]],
        },
      },
      {
        type: 'Feature',
        properties: { WKR_NR: 1, WKR_NAME: 'Flensburg – Schleswig', LAND_NR: 1, LAND_NAME: 'Schleswig-Holstein' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[9.40, 54.70], [9.60, 54.70], [9.60, 54.90], [9.40, 54.90], [9.40, 54.70]]],
        },
      },
      {
        type: 'Feature',
        properties: { WKR_NR: 258, WKR_NAME: 'Muenchen-Nord', LAND_NR: 9, LAND_NAME: 'Bayern' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[11.50, 48.15], [11.60, 48.15], [11.60, 48.22], [11.50, 48.22], [11.50, 48.15]]],
        },
      },
      {
        type: 'Feature',
        properties: { WKR_NR: 93, WKR_NAME: 'Koeln I', LAND_NR: 5, LAND_NAME: 'Nordrhein-Westfalen' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[6.92, 50.92], [7.00, 50.92], [7.00, 50.97], [6.92, 50.97], [6.92, 50.92]]],
        },
      },
    ],
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(placeholder));
  console.log(`Placeholder created: ${OUTPUT_FILE} (${placeholder.features.length} sample features)`);
  console.log('Run with a real GeoJSON file to generate full data:');
  console.log('  node scripts/process-geojson.mjs path/to/btw2025_geometrie_wahlkreise.geojson');
}
