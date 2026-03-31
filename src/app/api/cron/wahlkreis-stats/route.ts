import { NextResponse } from 'next/server';
import { aggregateWahlkreisStats } from '@/server/services/wahlkreis-stats.service';

// Vercel Cron: Wahlkreis-Statistik-Aggregation.
// Schedule: every 6 hours.
// Protected by CRON_SECRET.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await aggregateWahlkreisStats();
    console.log(`[wahlkreis-stats] Aggregation complete — ${result.updated} Wahlkreise updated`);

    return NextResponse.json(
      { success: true, wahlkreiseUpdated: result.updated },
      { status: 200 },
    );
  } catch (error) {
    console.error('[wahlkreis-stats] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Wahlkreis stats aggregation failed' },
      { status: 500 },
    );
  }
}
