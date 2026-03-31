import { NextResponse } from 'next/server';
import { sendWeeklyDigests } from '@/server/services/email-digest.service';

/**
 * Vercel Cron: Woechentlicher Email-Digest.
 * Schedule: Montag 07:00 UTC (08:00 CET).
 * Protected by CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendWeeklyDigests();
    console.log('[weekly-digest] Abgeschlossen:', result);

    return NextResponse.json(
      {
        success: true,
        sent: result.sent,
        errors: result.errors,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[weekly-digest] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Weekly digest cron failed' },
      { status: 500 },
    );
  }
}
