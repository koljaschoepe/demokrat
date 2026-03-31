import * as Sentry from '@sentry/nextjs';

/** Track a performance metric (latency distribution) */
export function trackMetric(
  name: string,
  value: number,
  unit?: string,
): void {
  Sentry.metrics.distribution(name, value, { unit: unit ?? 'millisecond' });
}

/** Track a counter metric */
export function trackCount(
  name: string,
  attributes?: Record<string, string>,
): void {
  Sentry.metrics.count(name, 1, { attributes });
}

/** Wrap an async function with performance tracking */
export async function withMetrics<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    trackMetric(name, Date.now() - start);
    return result;
  } catch (error) {
    trackMetric(name, Date.now() - start);
    trackCount(`${name}.error`);
    throw error;
  }
}
