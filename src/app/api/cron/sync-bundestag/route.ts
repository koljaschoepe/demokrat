import { NextResponse } from 'next/server';
import { runBundestagSync } from '@/server/services/bundestag-sync.service';

/**
 * Vercel Cron: Bundestag-Datensync.
 * Schedule: every 15 min during Sitzungswochen, every 6h otherwise.
 * Protected by CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBundestagSync();

    if (result.errors.length > 0) {
      // Partial success — log errors but return 200 so cron doesn't retry
      console.error('[sync-bundestag] Errors:', result.errors);
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[sync-bundestag] Fatal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 },
    );
  }
}
