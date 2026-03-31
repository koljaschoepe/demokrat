import type { MetadataRoute } from 'next';

/**
 * Phase 192 -- robots.txt generation.
 *
 * Allows crawling of public pages while blocking
 * API endpoints, admin, settings, and profile routes.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://demokrat.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/einstellungen/', '/profil/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
