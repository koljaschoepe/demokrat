import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';

/**
 * Phase 196 — Detailed health check for monitoring services.
 * Protected by CRON_SECRET — not for public consumption.
 */

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseMs: number;
  message?: string;
  details?: Record<string, unknown>;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const services: ServiceStatus[] = [];

  // Check Supabase with connection test
  const supabaseStart = Date.now();
  try {
    const admin = createAdminClient() as any;
    const { data, error } = await admin
      .from('platform_metrics')
      .select('metric_date')
      .limit(1);
    const elapsed = Date.now() - supabaseStart;
    if (error) {
      services.push({
        name: 'Supabase',
        status: 'degraded',
        responseMs: elapsed,
        message: error.message,
      });
    } else {
      services.push({
        name: 'Supabase',
        status: elapsed > 3000 ? 'degraded' : 'healthy',
        responseMs: elapsed,
        details: { rowsReturned: Array.isArray(data) ? data.length : 0 },
      });
    }
  } catch (err) {
    services.push({
      name: 'Supabase',
      status: 'down',
      responseMs: Date.now() - supabaseStart,
      message: err instanceof Error ? err.message : 'Connection failed',
    });
  }

  // Check Redis with read/write test
  const redisStart = Date.now();
  try {
    const testKey = `health:detailed:${Date.now()}`;
    await cache.set(testKey, 'ok', 10);
    const val = await cache.get<string>(testKey);
    await cache.del(testKey);
    const elapsed = Date.now() - redisStart;
    if (val === 'ok') {
      services.push({
        name: 'Redis',
        status: elapsed > 1000 ? 'degraded' : 'healthy',
        responseMs: elapsed,
      });
    } else {
      services.push({
        name: 'Redis',
        status: 'degraded',
        responseMs: elapsed,
        message: 'Read-back mismatch',
      });
    }
  } catch (err) {
    services.push({
      name: 'Redis',
      status: 'down',
      responseMs: Date.now() - redisStart,
      message: err instanceof Error ? err.message : 'Connection failed',
    });
  }

  // Check Meilisearch
  const meiliStart = Date.now();
  try {
    const meiliHost = process.env.MEILISEARCH_HOST;
    if (meiliHost) {
      const res = await fetch(`${meiliHost}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      const elapsed = Date.now() - meiliStart;
      if (res.ok) {
        services.push({
          name: 'Meilisearch',
          status: elapsed > 2000 ? 'degraded' : 'healthy',
          responseMs: elapsed,
        });
      } else {
        services.push({
          name: 'Meilisearch',
          status: 'degraded',
          responseMs: elapsed,
          message: `HTTP ${String(res.status)}`,
        });
      }
    } else {
      services.push({
        name: 'Meilisearch',
        status: 'degraded',
        responseMs: 0,
        message: 'MEILISEARCH_HOST not configured',
      });
    }
  } catch (err) {
    services.push({
      name: 'Meilisearch',
      status: 'down',
      responseMs: Date.now() - meiliStart,
      message: err instanceof Error ? err.message : 'Connection failed',
    });
  }

  // Check DIP API
  const dipStart = Date.now();
  try {
    const dipKey = process.env.DIP_API_KEY;
    if (dipKey) {
      const res = await fetch(
        'https://search.dip.bundestag.de/api/v1/vorgang?f.datum.start=2026-01-01&rows=1',
        {
          headers: { Authorization: `ApiKey ${dipKey}` },
          signal: AbortSignal.timeout(5000),
        },
      );
      const elapsed = Date.now() - dipStart;
      services.push({
        name: 'DIP API',
        status: res.ok ? (elapsed > 3000 ? 'degraded' : 'healthy') : 'degraded',
        responseMs: elapsed,
        message: res.ok ? undefined : `HTTP ${String(res.status)}`,
      });
    } else {
      services.push({
        name: 'DIP API',
        status: 'degraded',
        responseMs: 0,
        message: 'DIP_API_KEY not configured',
      });
    }
  } catch (err) {
    services.push({
      name: 'DIP API',
      status: 'down',
      responseMs: Date.now() - dipStart,
      message: err instanceof Error ? err.message : 'Connection failed',
    });
  }

  // Check active sync runs
  let activeSyncRuns = 0;
  try {
    const admin = createAdminClient() as any;
    const { data, error } = await admin
      .from('sync_runs')
      .select('id')
      .eq('status', 'running');
    if (!error && Array.isArray(data)) {
      activeSyncRuns = data.length;
    }
  } catch {
    // Non-critical — skip
  }

  const overall = services.every((s) => s.status === 'healthy')
    ? 'healthy'
    : services.some((s) => s.status === 'down')
      ? 'down'
      : 'degraded';

  return NextResponse.json({
    status: overall,
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION ?? 'local',
    services,
    meta: {
      activeSyncRuns,
    },
  });
}
