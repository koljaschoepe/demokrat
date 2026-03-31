import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

/**
 * Phase 196 — Cron health check.
 * Calls the detailed health endpoint and alerts via Sentry if any service is down.
 * Protected by CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const res = await fetch(`${appUrl}/api/health/detailed`, {
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      Sentry.captureMessage('Health check endpoint returned non-OK status', {
        level: 'error',
        tags: { cron: 'health-check' },
        extra: { status: res.status },
      });
      return NextResponse.json(
        { success: false, error: `Health endpoint returned ${String(res.status)}` },
        { status: 500 },
      );
    }

    const health = (await res.json()) as {
      status: string;
      services: Array<{ name: string; status: string; message?: string }>;
    };

    // Alert on any down services
    const downServices = health.services.filter((s) => s.status === 'down');
    const degradedServices = health.services.filter(
      (s) => s.status === 'degraded',
    );

    if (downServices.length > 0) {
      const names = downServices.map((s) => s.name).join(', ');
      Sentry.captureMessage(`Services DOWN: ${names}`, {
        level: 'error',
        tags: { cron: 'health-check', severity: 'critical' },
        extra: { downServices, degradedServices },
      });
      console.error('[health-check] Services DOWN:', names);
    }

    if (degradedServices.length > 0) {
      const names = degradedServices.map((s) => s.name).join(', ');
      Sentry.captureMessage(`Services DEGRADED: ${names}`, {
        level: 'warning',
        tags: { cron: 'health-check', severity: 'warning' },
        extra: { degradedServices },
      });
      console.warn('[health-check] Services DEGRADED:', names);
    }

    return NextResponse.json({
      success: true,
      overall: health.status,
      down: downServices.map((s) => s.name),
      degraded: degradedServices.map((s) => s.name),
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { cron: 'health-check' },
    });
    console.error('[health-check] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Health check failed' },
      { status: 500 },
    );
  }
}
