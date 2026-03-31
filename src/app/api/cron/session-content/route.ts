import { NextResponse } from 'next/server';
import { generateDailySessionContent } from '@/server/services/session-content.service';

/**
 * Vercel Cron: Tägliche Session-Content-Generierung.
 * Schedule: daily at 04:00 UTC (05:00 CET).
 * Prepares today's session content (votes, debates, topics).
 * Protected by CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await generateDailySessionContent();
    console.log('[session-content] Daily content generated:', result);

    return NextResponse.json({ success: true, content: result }, { status: 200 });
  } catch (error) {
    console.error('[session-content] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Session content generation failed' },
      { status: 500 },
    );
  }
}
