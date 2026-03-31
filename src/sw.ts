/// <reference lib="webworker" />
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from 'serwist';
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  Serwist,
  StaleWhileRevalidate,
} from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & WorkerGlobalScope;

const CACHE_VERSION = 'v1';

/**
 * Cache-First for static assets: JS, CSS, fonts, images
 */
const staticAssetsCache: RuntimeCaching = {
  matcher: ({ request }) => {
    const dest = request.destination;
    return (
      dest === 'script' ||
      dest === 'style' ||
      dest === 'font' ||
      dest === 'image'
    );
  },
  handler: new CacheFirst({
    cacheName: `${CACHE_VERSION}-static-assets`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
};

/**
 * Network-First for API calls with cache fallback
 */
const apiCache: RuntimeCaching = {
  matcher: ({ url }) => {
    return (
      url.pathname.startsWith('/api/') || url.pathname.startsWith('/trpc/')
    );
  },
  handler: new NetworkFirst({
    cacheName: `${CACHE_VERSION}-api-cache`,
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  }),
};

/**
 * Stale-While-Revalidate for page data
 */
const pageCache: RuntimeCaching = {
  matcher: ({ request }) => {
    return request.destination === 'document';
  },
  handler: new StaleWhileRevalidate({
    cacheName: `${CACHE_VERSION}-page-cache`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
    ],
  }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [staticAssetsCache, apiCache, pageCache],
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();
