import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import { createDipClient } from './client';
import { mapVorgangToDbInsert, mapVorgangToTopicInsert } from './mappers';
import type { DipVorgang } from './types';

const CACHE_KEY_LAST_SYNC = 'dip:last_sync';

/** Ergebnis einer Sync-Operation */
export interface SyncResult {
  created: number;
  updated: number;
}

/**
 * Vorgänge aus dem DIP synchronisieren.
 * Holt alle Vorgänge die seit dem letzten Sync aktualisiert wurden.
 * Idempotent: Upsert via dip_id UNIQUE-Constraint.
 *
 * @param since - ISO-Datum ab dem synchronisiert wird. Falls nicht angegeben, wird der letzte Sync-Zeitpunkt aus Redis verwendet.
 * @param wahlperiode - Wahlperiode (Standard: 21 für aktuelle Legislatur)
 */
export async function syncVorgaenge(
  since?: string,
  wahlperiode = 21,
): Promise<SyncResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const dip = createDipClient();

  // Letzten Sync-Zeitpunkt aus Redis holen falls nicht explizit angegeben
  const syncSince = since ?? (await cache.get<string>(CACHE_KEY_LAST_SYNC));
  const syncStartTime = new Date().toISOString();

  // Vorgänge von der DIP-API abrufen
  const vorgaenge = await dip.getAllVorgaenge({
    wahlperiode,
    ...(syncSince ? { aktualisiertStart: syncSince } : {}),
  });

  let created = 0;
  let updated = 0;

  // Jeden Vorgang verarbeiten
  for (const vorgang of vorgaenge) {
    const result = await upsertVorgang(supabase, vorgang);
    if (result === 'created') created++;
    if (result === 'updated') updated++;
  }

  // Sync-Zeitpunkt in Redis speichern (kein TTL — bleibt bestehen)
  await cache.set(CACHE_KEY_LAST_SYNC, syncStartTime);

  return { created, updated };
}

/**
 * Einzelnen Vorgang upserten: Topic + bundestag_vorgaenge Eintrag.
 * Prüft ob ein Eintrag mit dieser dip_id existiert und updated oder erstellt.
 */
async function upsertVorgang(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  vorgang: DipVorgang,
): Promise<'created' | 'updated' | 'error'> {
  const vorgangInsert = mapVorgangToDbInsert(vorgang);
  const topicInsert = mapVorgangToTopicInsert(vorgang);

  try {
    // Prüfen ob der Vorgang bereits existiert
    const { data: existing } = await supabase
      .from('bundestag_vorgaenge')
      .select('id, topic_id')
      .eq('dip_id', vorgang.id)
      .single();

    if (existing) {
      // Vorgang existiert bereits — Update durchführen
      await updateExistingVorgang(supabase, existing, vorgangInsert, topicInsert);
      return 'updated';
    }

    // Neuen Vorgang erstellen: erst Topic, dann Vorgang mit Referenz
    await createNewVorgang(supabase, vorgangInsert, topicInsert);
    return 'created';
  } catch (error) {
    console.error(`[DIP Sync] Fehler beim Upsert von Vorgang ${vorgang.id}:`, error);
    return 'error';
  }
}

/**
 * Neuen Vorgang mit zugehörigem Topic erstellen.
 */
async function createNewVorgang(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  vorgangInsert: ReturnType<typeof mapVorgangToDbInsert>,
  topicInsert: ReturnType<typeof mapVorgangToTopicInsert>,
): Promise<void> {
  // Topic erstellen
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .insert(topicInsert)
    .select('id')
    .single();

  if (topicError) {
    throw new Error(`Topic-Erstellung fehlgeschlagen: ${topicError.message}`);
  }

  // Vorgang mit Topic-Referenz erstellen
  const { error: vorgangError } = await supabase
    .from('bundestag_vorgaenge')
    .insert({
      ...vorgangInsert,
      topic_id: topic.id,
    });

  if (vorgangError) {
    // Rollback: Topic wieder löschen wenn Vorgang-Erstellung fehlschlägt
    await supabase.from('topics').delete().eq('id', topic.id);
    throw new Error(`Vorgang-Erstellung fehlgeschlagen: ${vorgangError.message}`);
  }
}

/**
 * Bestehenden Vorgang und zugehörigen Topic aktualisieren.
 */
async function updateExistingVorgang(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  existing: { id: string; topic_id: string | null },
  vorgangInsert: ReturnType<typeof mapVorgangToDbInsert>,
  topicInsert: ReturnType<typeof mapVorgangToTopicInsert>,
): Promise<void> {
  // Vorgang aktualisieren
  const { error: vorgangError } = await supabase
    .from('bundestag_vorgaenge')
    .update({
      titel: vorgangInsert.titel,
      abstract: vorgangInsert.abstract,
      sachgebiet: vorgangInsert.sachgebiet,
      vorgangstyp: vorgangInsert.vorgangstyp,
      beratungsstand: vorgangInsert.beratungsstand,
      initiative: vorgangInsert.initiative,
      datum: vorgangInsert.datum,
      aktualisiert: vorgangInsert.aktualisiert,
      deskriptor: vorgangInsert.deskriptor,
      raw_data: vorgangInsert.raw_data,
      synced_at: vorgangInsert.synced_at,
    })
    .eq('id', existing.id);

  if (vorgangError) {
    throw new Error(`Vorgang-Update fehlgeschlagen: ${vorgangError.message}`);
  }

  // Topic aktualisieren falls vorhanden
  if (existing.topic_id) {
    const { error: topicError } = await supabase
      .from('topics')
      .update({
        title: topicInsert.title,
        description: topicInsert.description,
        summary: topicInsert.summary,
        category: topicInsert.category,
        status: topicInsert.status,
      })
      .eq('id', existing.topic_id);

    if (topicError) {
      console.warn(
        `[DIP Sync] Topic-Update für ${existing.topic_id} fehlgeschlagen: ${topicError.message}`,
      );
    }
  }
}
