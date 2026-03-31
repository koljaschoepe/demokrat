/**
 * Phase 141 -- Comment Count Konsistenz-Service
 *
 * Stellt sicher, dass topics.comment_count mit der tatsaechlichen
 * Anzahl der Kommentare uebereinstimmt.
 */

import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

/**
 * Synchronisiert den Kommentar-Zaehler eines einzelnen Themas.
 *
 * @param topicId - ID des Themas
 * @returns Die tatsaechliche Kommentaranzahl
 */
export async function syncCommentCount(topicId: string): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { count, error: countError } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', topicId)
    .eq('is_flagged', false);

  if (countError) {
    throw new Error(`Kommentare konnten nicht gezählt werden: ${countError.message}`);
  }

  const actualCount = count ?? 0;

  const { error: updateError } = await supabase
    .from('topics')
    .update({
      comment_count: actualCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', topicId);

  if (updateError) {
    throw new Error(`Zähler konnte nicht aktualisiert werden: ${updateError.message}`);
  }

  return actualCount;
}

/**
 * Synchronisiert die Kommentar-Zaehler aller Themen.
 * Dient als Sicherheitsnetz fuer Inkonsistenzen.
 *
 * @returns Anzahl der korrigierten Themen
 */
export async function syncAllCommentCounts(): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  let corrected = 0;
  let offset = 0;
  const pageSize = 500;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data: topics, error } = await supabase
      .from('topics')
      .select('id, comment_count')
      .range(offset, offset + pageSize - 1)
      .order('id');

    if (error) {
      throw new Error(`Themen konnten nicht geladen werden: ${error.message}`);
    }

    const rows = (topics ?? []) as AnyRow[];
    if (rows.length === 0) break;

    for (const topic of rows) {
      const { count } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('topic_id', topic.id)
        .eq('is_flagged', false);

      const actualCount = count ?? 0;
      const storedCount = (topic.comment_count ?? 0) as number;

      if (actualCount !== storedCount) {
        await supabase
          .from('topics')
          .update({ comment_count: actualCount })
          .eq('id', topic.id);
        corrected++;
      }
    }

    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return corrected;
}
