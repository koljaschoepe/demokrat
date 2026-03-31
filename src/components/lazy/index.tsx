'use client';

import dynamic from 'next/dynamic';
import { ChartSkeleton } from './chart-skeleton';
import { MapSkeleton } from './map-skeleton';

/**
 * Phase 190 -- Central lazy-loading exports for heavy components.
 *
 * Usage:
 *   import { LazyBaseMap, LazyResponsiveContainer } from '@/components/lazy';
 *
 * All components are loaded dynamically with SSR disabled to reduce
 * initial bundle size. Skeleton placeholders are shown during loading.
 */

// ---------------------------------------------------------------------------
// Map components (Mapbox GL -- heavy, ~200 KB gzipped)
// ---------------------------------------------------------------------------

export const LazyBaseMap = dynamic(
  () => import('@/components/map/base-map').then((mod) => ({ default: mod.BaseMap })),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

export const LazyWahlkreisDashboard = dynamic(
  () =>
    import('@/components/map/wahlkreis-dashboard').then((mod) => ({
      default: mod.WahlkreisDashboard,
    })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={300} />,
  },
);

// ---------------------------------------------------------------------------
// Chart components (recharts -- heavy, ~150 KB gzipped)
// ---------------------------------------------------------------------------

export const LazyResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  },
);

export const LazyVoteDonutChart = dynamic(
  () =>
    import('@/components/charts/vote-donut-chart').then((mod) => ({
      default: mod.VoteDonutChart,
    })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={250} />,
  },
);

export const LazyVoteBarChart = dynamic(
  () =>
    import('@/components/charts/vote-bar-chart').then((mod) => ({
      default: mod.VoteBarChart,
    })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={250} />,
  },
);

export const LazyTrendSparkline = dynamic(
  () =>
    import('@/components/charts/trend-sparkline').then((mod) => ({
      default: mod.TrendSparkline,
    })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={60} />,
  },
);

// ---------------------------------------------------------------------------
// Re-export skeletons so consumers can use them independently
// ---------------------------------------------------------------------------

export { ChartSkeleton } from './chart-skeleton';
export { MapSkeleton } from './map-skeleton';
