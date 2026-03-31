import withSerwistInit from '@serwist/next';
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import './src/lib/env.ts';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withSerwist = withSerwistInit({
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
};

export default withSerwist(withNextIntl(nextConfig));
