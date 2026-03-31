import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://demokrat.app';

/**
 * Phase 192 -- Dynamic sitemap for SEO.
 *
 * Lists all public, crawlable pages with appropriate
 * change frequencies and priority signals.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Landing
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },

    // Core public pages
    { url: `${BASE_URL}/feed`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/karte`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },

    // Legal pages
    { url: `${BASE_URL}/datenschutz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/nutzungsbedingungen`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/impressum`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/community-regeln`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },

    // Transparency pages
    { url: `${BASE_URL}/transparenz`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/transparenz/algorithmus`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/transparenz/punktesystem`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/transparenz/bridging`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/transparenz/daten`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];
}
