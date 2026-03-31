import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Demokrat',
    short_name: 'Demokrat',
    description: 'Digitale Demokratie-Plattform für politische Teilhabe',
    start_url: '/feed',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#4F46E5',
    orientation: 'portrait',
    scope: '/',
    id: '/',
    categories: ['government', 'politics', 'news'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
