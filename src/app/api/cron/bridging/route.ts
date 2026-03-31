import { NextResponse } from 'next/server';
import { recalculateBridgingScores } from '@/server/lib/bridging';

/**
 * Vercel Cron: Bridging-Score-Neuberechnung.
 * Schedule: every 60 minutes.
 * Berechnet fuer alle Kommentare mit genuegend Bewertungen den
 * Bridging-Score neu und vergibt ggf. Punkte/Benachrichtigungen.
 * Protected by CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await recalculateBridgingScores();
    console.log(`[bridging] Recalculation complete — ${result.updated} updated, ${result.highBridging} newly high-bridging`);
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error('[bridging] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bridging score recalculation failed' },
      { status: 500 },
    );
  }
}
