/**
 * KI-Zusammenfassungen für Bundestag-Vorgänge.
 * Generiert verständliche Summaries (B1-Niveau) und speichert sie im Topic.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { SUMMARY_SYSTEM_PROMPT, buildSummaryUserPrompt } from '@/lib/prompts/summary';
import { chatCompletion } from './openai';

/**
 * Generiert eine KI-Zusammenfassung für einen Bundestag-Vorgang
 * und speichert sie als summary im zugehörigen Topic.
 */
export async function generateSummaryForVorgang(vorgangId: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Vorgang laden
  const { data: vorgang, error } = await supabase
    .from('bundestag_vorgaenge')
    .select('*')
    .eq('id', vorgangId)
    .single();

  if (error || !vorgang) {
    throw new Error(`Vorgang ${vorgangId} nicht gefunden`);
  }

  const userPrompt = buildSummaryUserPrompt({
    titel: vorgang.titel,
    abstract: vorgang.abstract,
    vorgangstyp: vorgang.vorgangstyp,
    beratungsstand: vorgang.beratungsstand,
    initiative: vorgang.initiative ?? [],
    sachgebiet: vorgang.sachgebiet,
    deskriptoren: vorgang.deskriptor,
  });

  const summary = await chatCompletion(SUMMARY_SYSTEM_PROMPT, userPrompt);

  // Summary im zugehörigen Topic speichern
  if (vorgang.topic_id) {
    await supabase
      .from('topics')
      .update({ summary, updated_at: new Date().toISOString() })
      .eq('id', vorgang.topic_id);
  }

  return summary;
}

/**
 * Generiert Zusammenfassungen für alle Vorgänge ohne Summary.
 */
export async function generateMissingSummaries(): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Alle Vorgänge mit Topic aber ohne Summary
  const { data: vorgaenge, error } = await supabase
    .from('bundestag_vorgaenge')
    .select('id, topic_id')
    .not('topic_id', 'is', null);

  if (error || !vorgaenge) return 0;

  // Nur die ohne Summary im Topic
  const { data: topicsWithSummary } = await supabase
    .from('topics')
    .select('id')
    .not('summary', 'is', null);

  const topicIdsWithSummary = new Set((topicsWithSummary ?? []).map((t: { id: string }) => t.id));
  const needsSummary = (vorgaenge as Array<{ id: string; topic_id: string }>)
    .filter((v) => !topicIdsWithSummary.has(v.topic_id));

  let generated = 0;
  for (const vorgang of needsSummary) {
    try {
      await generateSummaryForVorgang(vorgang.id);
      generated++;
      // Rate limit: small delay between API calls
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`Summary generation failed for ${vorgang.id}:`, err);
    }
  }

  return generated;
}
