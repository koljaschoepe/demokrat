/**
 * Phase 116 — Session Content Pipeline
 *
 * Generates daily session content for the 05:00 CET cron job.
 * Selects the best topic, creates briefing + quiz + bridging comment,
 * and upserts into session_content table.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import { chatCompletion, stripCodeFences } from '@/server/services/openai';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export interface SessionContentRow {
  content_date: string;
  topic_id: string;
  briefing: string;
  quiz_question: string;
  quiz_options: Array<{ text: string; is_correct: boolean }>;
  quiz_explanation: string;
  bridging_comment_id: string | null;
}

/**
 * Returns today's date in CET timezone as YYYY-MM-DD.
 */
function getCETDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

/**
 * Generates daily session content for a given date (defaults to today CET).
 * Called by the 05:00 CET cron job.
 *
 * Steps:
 * 1. Check if content already exists for date → skip
 * 2. Select best topic (Bundestag topics preferred during Sitzungswochen)
 * 3. Generate briefing if no summary exists
 * 4. Generate quiz via chatCompletion
 * 5. Select bridging comment with highest score
 * 6. UPSERT into session_content
 */
export async function generateDailySessionContent(
  date?: string,
): Promise<{ success: boolean; topicId: string | null }> {
  const contentDate = date ?? getCETDate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // 1. Check if session_content already exists for this date
  const { data: existing } = await supabase
    .from('session_content')
    .select('content_date')
    .eq('content_date', contentDate)
    .single();

  if (existing) {
    return { success: true, topicId: null };
  }

  // 2. Select best topic for today
  // Prefer active topics with Bundestag activity, then by supporter count, then by freshness
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, description, summary')
    .eq('status', 'active')
    .order('supporter_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  if (!topics || (topics as AnyRow[]).length === 0) {
    return { success: false, topicId: null };
  }

  // Check which topics have Bundestag abstimmungen (prefer those)
  const topicIds = (topics as AnyRow[]).map((t: AnyRow) => t.id as string);

  const { data: abstimmungen } = await supabase
    .from('bundestag_abstimmungen')
    .select('topic_id')
    .in('topic_id', topicIds);

  const topicsWithAbstimmung = new Set(
    ((abstimmungen ?? []) as AnyRow[]).map((a: AnyRow) => a.topic_id as string),
  );

  // Sort: topics with Bundestag activity first, then by original order
  const sortedTopics = [...(topics as AnyRow[])].sort((a, b) => {
    const aHasBT = topicsWithAbstimmung.has(a.id as string) ? 1 : 0;
    const bHasBT = topicsWithAbstimmung.has(b.id as string) ? 1 : 0;
    return bHasBT - aHasBT;
  });

  const selectedTopic = sortedTopics[0] as AnyRow;
  const topicId = selectedTopic.id as string;

  // 3. Generate briefing if no summary exists
  let briefing = selectedTopic.summary as string | null;

  if (!briefing) {
    const systemPrompt =
      'Du bist ein politischer Bildungsassistent. Erstelle ein kurzes Tagesbriefing (3 Sätze) zu folgendem Thema für eine deutsche Demokratie-App.';
    const userPrompt = `Thema: ${selectedTopic.title}\n\nBeschreibung: ${selectedTopic.description ?? 'Keine Beschreibung verfügbar.'}`;

    briefing = await chatCompletion(systemPrompt, userPrompt, {
      temperature: 0.5,
      maxTokens: 300,
    });

    // Also save the generated summary back to the topic
    await supabase
      .from('topics')
      .update({ summary: briefing })
      .eq('id', topicId);
  }

  // 4. Generate quiz via chatCompletion
  const quizSystemPrompt =
    'Erstelle eine Multiple-Choice-Frage (4 Optionen) zum folgenden politischen Thema. Antworte als JSON: {question, options: string[], correct_index: number, explanation}';
  const quizUserPrompt = `Thema: ${selectedTopic.title}\n\nBriefing: ${briefing}`;

  const quizRaw = await chatCompletion(quizSystemPrompt, quizUserPrompt, {
    temperature: 0.4,
    maxTokens: 500,
  });

  const quizParsed = JSON.parse(stripCodeFences(quizRaw)) as {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  };

  // Transform quiz options to the DB format
  const quizOptions = quizParsed.options.map((text: string, index: number) => ({
    text,
    is_correct: index === quizParsed.correct_index,
  }));

  // 5. Select bridging comment with highest bridging_score
  const { data: bridgingComment } = await supabase
    .from('comments')
    .select('id')
    .eq('topic_id', topicId)
    .order('bridging_score', { ascending: false })
    .limit(1)
    .single();

  const bridgingCommentId = bridgingComment
    ? ((bridgingComment as AnyRow).id as string)
    : null;

  // 6. UPSERT into session_content
  const { error } = await supabase.from('session_content').upsert(
    {
      content_date: contentDate,
      topic_id: topicId,
      briefing,
      quiz_question: quizParsed.question,
      quiz_options: quizOptions,
      quiz_explanation: quizParsed.explanation,
      bridging_comment_id: bridgingCommentId,
    },
    { onConflict: 'content_date' },
  );

  if (error) {
    throw new Error(`Session-Content-Erstellung fehlgeschlagen: ${error.message}`);
  }

  // Invalidate cache for this date
  await cache.del(`session_content:${contentDate}`);

  return { success: true, topicId };
}

/**
 * Fetches session content for a given date.
 * Cached in Redis with 5-minute TTL.
 */
export async function getSessionContent(
  date: string,
): Promise<SessionContentRow | null> {
  const cacheKey = `session_content:${date}`;

  // Check Redis cache first
  const cached = await cache.get<SessionContentRow>(cacheKey);
  if (cached) {
    return cached;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data, error } = await supabase
    .from('session_content')
    .select('content_date, topic_id, briefing, quiz_question, quiz_options, quiz_explanation, bridging_comment_id')
    .eq('content_date', date)
    .single();

  if (error || !data) {
    return null;
  }

  const row = data as AnyRow;
  const result: SessionContentRow = {
    content_date: row.content_date as string,
    topic_id: row.topic_id as string,
    briefing: row.briefing as string,
    quiz_question: row.quiz_question as string,
    quiz_options: row.quiz_options as Array<{ text: string; is_correct: boolean }>,
    quiz_explanation: row.quiz_explanation as string,
    bridging_comment_id: (row.bridging_comment_id as string) ?? null,
  };

  // Cache for 5 minutes
  await cache.set(cacheKey, result, 300);

  return result;
}
