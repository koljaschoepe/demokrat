import { NextResponse } from 'next/server';
import { computeDailyMetrics } from '@/server/services/platform-metrics.service';
import { reconcileAllTiers } from '@/server/services/privileges.service';

/**
 * Vercel Cron: Plattform-Metriken und Tier-Reconciliation.
 * Schedule: daily at 22:30 UTC (23:30 CET).
 * - Computes daily platform metrics (puls_score, activity, etc.).
 * - Reconciles privilege tiers for all users.
 * Protected by CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const metrics = await computeDailyMetrics();
    const pulsScore = typeof metrics === 'object' && metrics !== null && 'puls_score' in metrics
      ? (metrics as { puls_score: number }).puls_score
      : null;
    console.log('[platform-metrics] Daily metrics computed — puls_score:', pulsScore);

    const tierResult = await reconcileAllTiers();
    console.log('[platform-metrics] Tier reconciliation complete:', tierResult);

    return NextResponse.json(
      {
        success: true,
        pulsScore,
        tierReconciliation: tierResult,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[platform-metrics] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Platform metrics cron failed' },
      { status: 500 },
    );
  }
}
