import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Phase 197 -- Bundestag-Daten Pre-Load.
 * Checks data completeness for Bundestag topics, summaries, quizzes, and MdB data.
 * Schedule: daily at 3:00 AM (see vercel.json).
 * Protected by CRON_SECRET.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const results: Record<string, unknown> = {};

  try {
    // Step 1: Count existing Bundestag topics
    const { count: topicCount } = await supabase
      .from('topics')
      .select('id', { count: 'exact', head: true })
      .eq('source', 'BUNDESTAG');

    results.existingTopics = topicCount ?? 0;

    // Step 2: Check topics without summaries
    const { count: noSummary } = await supabase
      .from('topics')
      .select('id', { count: 'exact', head: true })
      .eq('source', 'BUNDESTAG')
      .is('ai_summary', null);

    results.topicsWithoutSummary = noSummary ?? 0;

    // Step 3: Check topics without quiz
    const { data: topicsWithoutQuiz } = await supabase
      .from('topics')
      .select('id')
      .eq('source', 'BUNDESTAG')
      .not(
        'id',
        'in',
        supabase
          .from('session_content')
          .select('topic_id')
          .eq('content_type', 'quiz'),
      )
      .limit(10);

    results.topicsWithoutQuiz =
      (topicsWithoutQuiz as unknown[] | null)?.length ?? 0;

    // Step 4: Check MdB data completeness
    const { count: mdbCount } = await supabase
      .from('bundestag_mdb')
      .select('id', { count: 'exact', head: true });

    results.mdbCount = mdbCount ?? 0;

    // Step 5: Summary
    results.status =
      (topicCount ?? 0) >= 50 ? 'ready' : 'needs_more_data';
    results.timestamp = new Date().toISOString();

    return NextResponse.json(results);
  } catch (error) {
    console.error('[preload-bundestag] Fatal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Preload check failed' },
      { status: 500 },
    );
  }
}
