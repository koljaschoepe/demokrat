import { NextResponse } from 'next/server';
import { resetExpiredStreaks, replenishShields } from '@/server/services/streak.service';

/**
 * Vercel Cron: Streak-Management.
 * Schedule: daily at 22:00 UTC (23:00 CET).
 * - Resets streaks for users who missed their daily activity.
 * - Replenishes shields every Monday.
 * Protected by CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const resetResult = await resetExpiredStreaks();
    console.log('[streaks] Expired streaks reset:', resetResult);

    // Replenish shields only on Mondays (getUTCDay() === 1)
    const today = new Date();
    let shieldsResult: unknown = null;
    if (today.getUTCDay() === 1) {
      shieldsResult = await replenishShields();
      console.log('[streaks] Shields replenished:', shieldsResult);
    } else {
      console.log('[streaks] Not Monday — skipping shield replenishment');
    }

    return NextResponse.json(
      {
        success: true,
        streaksReset: resetResult,
        shieldsReplenished: shieldsResult,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[streaks] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Streak cron failed' },
      { status: 500 },
    );
  }
}
