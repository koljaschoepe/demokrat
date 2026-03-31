/**
 * Phase 156 — Dynamic Mapbox GL JS Loader
 *
 * Loads Mapbox GL JS from CDN to avoid npm dependency.
 * Returns the mapboxgl global once loaded.
 */

const MAPBOX_GL_VERSION = 'v3.9.4';
const CSS_URL = `https://api.mapbox.com/mapbox-gl-js/${MAPBOX_GL_VERSION}/mapbox-gl.css`;
const JS_URL = `https://api.mapbox.com/mapbox-gl-js/${MAPBOX_GL_VERSION}/mapbox-gl.js`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let loadPromise: Promise<any> | null = null;

// Declare mapboxgl on window
declare global {
  // eslint-disable-next-line no-var
  var mapboxgl: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function loadCSS(): void {
  if (document.querySelector(`link[href="${CSS_URL}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = CSS_URL;
  document.head.appendChild(link);
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.mapboxgl !== 'undefined') {
      resolve();
      return;
    }
    if (document.querySelector(`script[src="${JS_URL}"]`)) {
      // Script already being loaded, wait for it
      const check = setInterval(() => {
        if (typeof window.mapboxgl !== 'undefined') {
          clearInterval(check);
          resolve();
        }
      }, 50);
      return;
    }
    const script = document.createElement('script');
    script.src = JS_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Mapbox GL JS'));
    document.head.appendChild(script);
  });
}

/**
 * Loads Mapbox GL JS from CDN. Returns the mapboxgl global.
 * Safe to call multiple times — only loads once.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadMapboxGL(): Promise<any> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    loadCSS();
    await loadScript();
    return window.mapboxgl;
  })();

  return loadPromise;
}

/**
 * Returns true if the Mapbox token is configured.
 */
export function isMapboxConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
}
