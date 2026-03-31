import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Vercel Cron: Schließt abgelaufene Abstimmungen.
 * Schedule: every minute.
 * UPDATE topics SET status='voting_closed' WHERE status='active' AND voting_closes_at <= now()
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('topics')
      .update({ status: 'voting_closed', updated_at: new Date().toISOString() })
      .eq('status', 'active')
      .lte('voting_closes_at', new Date().toISOString())
      .select('id');

    if (error) {
      throw new Error(`Vote closing failed: ${error.message}`);
    }

    const closed = data?.length ?? 0;
    if (closed > 0) {
      console.log(`[close-votes] Closed ${closed} topic(s)`);
    }

    return NextResponse.json({ closed }, { status: 200 });
  } catch (error) {
    console.error('[close-votes] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to close votes' },
      { status: 500 },
    );
  }
}
