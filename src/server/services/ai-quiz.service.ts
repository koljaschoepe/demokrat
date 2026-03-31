/**
 * KI-generierte Quiz-Fragen zu Bundestag-Vorgängen.
 * Multiple Choice mit 4 Optionen, Validierung und Retry-Logik.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { QUIZ_SYSTEM_PROMPT, buildQuizUserPrompt } from '@/lib/prompts/quiz';
import { chatCompletion, stripCodeFences } from './openai';

export interface QuizResult {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

const MAX_RETRIES = 2;

/**
 * Parst und validiert die Quiz-JSON-Antwort von OpenAI.
 */
function parseQuizResponse(raw: string): QuizResult {
  const cleaned = stripCodeFences(raw);
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  // Validierung: question muss ein String sein
  if (typeof parsed.question !== 'string' || parsed.question.length === 0) {
    throw new Error('Invalid quiz response: missing or empty question');
  }

  // Validierung: genau 4 Optionen
  if (!Array.isArray(parsed.options) || parsed.options.length !== 4) {
    throw new Error(`Invalid quiz response: expected 4 options, got ${Array.isArray(parsed.options) ? parsed.options.length : 'none'}`);
  }

  // Alle Optionen müssen Strings sein
  for (let i = 0; i < parsed.options.length; i++) {
    if (typeof parsed.options[i] !== 'string' || (parsed.options[i] as string).length === 0) {
      throw new Error(`Invalid quiz response: option ${i} is not a valid string`);
    }
  }

  // Validierung: correct_index 0-3
  if (typeof parsed.correct_index !== 'number' || parsed.correct_index < 0 || parsed.correct_index > 3) {
    throw new Error(`Invalid quiz response: correct_index must be 0-3, got ${parsed.correct_index}`);
  }

  // Validierung: explanation muss ein String sein
  if (typeof parsed.explanation !== 'string' || parsed.explanation.length === 0) {
    throw new Error('Invalid quiz response: missing or empty explanation');
  }

  return {
    question: parsed.question,
    options: parsed.options as string[],
    correct_index: parsed.correct_index,
    explanation: parsed.explanation,
  };
}

/**
 * Generiert eine Quiz-Frage für ein Topic mit zugehörigem Vorgang.
 * Retry bei Parse-Fehlern (bis zu 2 Versuche).
 */
export async function generateQuizForTopic(topicId: string): Promise<QuizResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Topic mit Summary laden
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('id, title, summary')
    .eq('id', topicId)
    .single();

  if (topicError || !topic) {
    throw new Error(`Topic ${topicId} nicht gefunden`);
  }

  if (!topic.summary) {
    throw new Error(`Topic ${topicId} hat keine Zusammenfassung — Quiz-Generierung nicht möglich`);
  }

  // Zugehörigen Vorgang laden für Zusatzinformationen
  const { data: vorgang } = await supabase
    .from('bundestag_vorgaenge')
    .select('vorgangstyp, sachgebiet')
    .eq('topic_id', topicId)
    .limit(1)
    .single();

  const userPrompt = buildQuizUserPrompt({
    titel: topic.title,
    summary: topic.summary,
    vorgangstyp: vorgang?.vorgangstyp ?? 'Gesetzgebung',
    sachgebiet: vorgang?.sachgebiet,
  });

  // Quiz generieren mit Retry-Logik
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const raw = await chatCompletion(QUIZ_SYSTEM_PROMPT, userPrompt, {
        temperature: 0.5,
        maxTokens: 600,
      });
      return parseQuizResponse(raw);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Nur bei Parse-/Validierungsfehlern erneut versuchen, nicht bei API-Fehlern
      if (lastError.message.startsWith('OpenAI API error')) {
        throw lastError;
      }
      console.warn(`Quiz generation attempt ${attempt + 1} failed: ${lastError.message}`);
      // Kurze Pause vor erneutem Versuch
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  throw new Error(`Quiz generation failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}
