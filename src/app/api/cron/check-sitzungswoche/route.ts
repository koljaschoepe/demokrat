import { NextResponse } from 'next/server';
import { updateSitzungswochenStatus } from '@/server/services/sitzungswoche.service';

/**
 * Vercel Cron: Tägliche Aktualisierung der Sitzungswochen-Status.
 * Schedule: daily at 00:05 UTC.
 * Protected by CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await updateSitzungswochenStatus();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[check-sitzungswoche] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status update failed' },
      { status: 500 },
    );
  }
}
