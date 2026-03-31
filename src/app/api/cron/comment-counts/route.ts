import { NextResponse } from 'next/server';
import { syncAllCommentCounts } from '@/server/services/comment-count.service';

// Vercel Cron: Kommentar-Zaehler Konsistenz-Check.
// Schedule: daily 03:00 UTC.
// Protected by CRON_SECRET.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const corrected = await syncAllCommentCounts();
    console.log(`[comment-counts] Sync complete — ${corrected} topics corrected`);

    return NextResponse.json(
      { success: true, corrected },
      { status: 200 },
    );
  } catch (error) {
    console.error('[comment-counts] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Comment count sync failed' },
      { status: 500 },
    );
  }
}
