/**
 * Orchestriert die Content-Pipeline für neue Bundestag-Vorgänge:
 * 1. Zusammenfassung generieren
 * 2. Quiz-Frage generieren
 * 3. Nachrichtenlinks kuratieren
 * 4. Session Content erstellen (für die tägliche Session)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { generateSummaryForVorgang } from './ai-summary.service';
import { generateQuizForTopic } from './ai-quiz.service';
import { generateNewsLinksForTopic } from './ai-news-links.service';

export interface PipelineResult {
  topicId: string;
  summary: boolean;
  quiz: boolean;
  newsLinks: number;
  sessionContent: boolean;
  errors: string[];
}

/**
 * Führt die komplette Content-Pipeline für einen neuen Vorgang aus.
 */
export async function runContentPipeline(vorgangId: string, topicId: string): Promise<PipelineResult> {
  const result: PipelineResult = {
    topicId,
    summary: false,
    quiz: false,
    newsLinks: 0,
    sessionContent: false,
    errors: [],
  };

  // 1. Zusammenfassung
  try {
    await generateSummaryForVorgang(vorgangId);
    result.summary = true;
  } catch (error) {
    result.errors.push(`Summary: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 2. Quiz (nur wenn Summary vorhanden)
  let quizData: { question: string; options: string[]; correct_index: number; explanation: string } | null = null;
  if (result.summary) {
    try {
      quizData = await generateQuizForTopic(topicId);
      result.quiz = true;
    } catch (error) {
      result.errors.push(`Quiz: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 3. Nachrichtenlinks
  try {
    const count = await generateNewsLinksForTopic(topicId);
    result.newsLinks = count;
  } catch (error) {
    result.errors.push(`News: ${error instanceof Error ? error.message : String(error)}`);
  }

  // 4. Session Content erstellen (für nächsten verfügbaren Tag)
  if (result.summary && quizData) {
    try {
      await createSessionContent(topicId, quizData);
      result.sessionContent = true;
    } catch (error) {
      result.errors.push(`Session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return result;
}

/**
 * Erstellt einen Session-Content-Eintrag für den nächsten freien Tag.
 */
async function createSessionContent(
  topicId: string,
  quiz: { question: string; options: string[]; correct_index: number; explanation: string }
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Topic-Summary als Briefing laden
  const { data: topic } = await supabase
    .from('topics')
    .select('summary')
    .eq('id', topicId)
    .single();

  if (!topic?.summary) {
    throw new Error('Topic has no summary for session briefing');
  }

  // Nächsten freien Tag finden
  const { data: latestSession } = await supabase
    .from('session_content')
    .select('content_date')
    .order('content_date', { ascending: false })
    .limit(1);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  let contentDate: Date;
  if (latestSession && latestSession.length > 0) {
    const lastDate = new Date(latestSession[0].content_date);
    lastDate.setDate(lastDate.getDate() + 1);
    contentDate = lastDate > tomorrow ? lastDate : tomorrow;
  } else {
    contentDate = tomorrow;
  }

  const { error } = await supabase.from('session_content').insert({
    content_date: contentDate.toISOString().split('T')[0],
    topic_id: topicId,
    briefing: topic.summary,
    quiz_question: quiz.question,
    quiz_options: quiz.options.map((text: string, index: number) => ({
      text,
      is_correct: index === quiz.correct_index,
    })),
    quiz_explanation: quiz.explanation,
  });

  if (error) {
    // Duplicate date — skip silently (unique constraint on content_date)
    if (error.code === '23505') return;
    throw new Error(`Session content creation failed: ${error.message}`);
  }
}

/**
 * Verarbeitet alle neuen Vorgänge ohne Content.
 * Aufgerufen nach dem Bundestag-Sync.
 */
export async function processNewVorgaenge(): Promise<PipelineResult[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Vorgänge mit Topic aber ohne Summary
  const { data: vorgaenge } = await supabase
    .from('bundestag_vorgaenge')
    .select('id, topic_id, topics!inner(summary)')
    .is('topics.summary', null)
    .not('topic_id', 'is', null);

  if (!vorgaenge || vorgaenge.length === 0) return [];

  const results: PipelineResult[] = [];
  for (const vorgang of vorgaenge as Array<{ id: string; topic_id: string }>) {
    const result = await runContentPipeline(vorgang.id, vorgang.topic_id);
    results.push(result);
    // Rate limit between API calls
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}
