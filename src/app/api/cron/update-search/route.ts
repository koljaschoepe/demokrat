import { NextResponse } from 'next/server';
import { syncTopicsToMeilisearch } from '@/server/services/meilisearch-sync.service';

/**
 * Vercel Cron: Meilisearch Index-Sync.
 * Schedule: every 30 minutes.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncTopicsToMeilisearch();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[update-search] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search sync failed' },
      { status: 500 },
    );
  }
}
