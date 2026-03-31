import { createAdminClient } from '@/lib/supabase/admin';
import { createAwClient } from './client';
import type { AwMandate, AwPolitician } from './types';

/** Bundestag 21. Legislaturperiode auf abgeordnetenwatch */
const BUNDESTAG_LEGISLATURE_ID = 132;

/** Ergebnis einer Sync-Operation */
export interface SyncResult {
  created: number;
  updated: number;
}

/** Shape für bundestag_mdb DB-Insert */
interface MdbInsert {
  abgeordnetenwatch_id: string;
  name: string;
  vorname: string;
  nachname: string;
  fraktion: string | null;
  wahlkreis_id: number | null;
  wahlkreis_name: string | null;
  raw_data: Record<string, unknown>;
  synced_at: string;
}

/**
 * Stammdaten aller MdBs der aktuellen Legislatur synchronisieren.
 * Holt alle Mandate der Legislatur 21 (ID=132) von abgeordnetenwatch,
 * ruft für jedes Mandat die Politiker-Details ab und upserted in bundestag_mdb.
 */
export async function syncMdbStammdaten(): Promise<SyncResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const aw = createAwClient();

  let created = 0;
  let updated = 0;

  // Alle Mandate der aktuellen Legislatur abrufen
  const mandates = await aw.getAllMandates(BUNDESTAG_LEGISLATURE_ID);

  // Politician-IDs aus den Mandaten extrahieren
  // Jedes Mandat referenziert einen Politiker über mandate.politician.id
  const politicianIds = [...new Set(mandates.map((m) => m.politician.id))];

  // Mandate nach Politician-ID indexieren für schnellen Zugriff
  const mandateByPolitician = new Map<number, AwMandate>();
  for (const mandate of mandates) {
    // Bei mehreren Mandaten pro Politiker das neueste nehmen
    mandateByPolitician.set(mandate.politician.id, mandate);
  }

  // Jeden Politiker verarbeiten
  for (const politicianId of politicianIds) {
    try {
      // Politiker-Details von AW abrufen
      const politicianResponse = await aw.getPolitician(politicianId);
      const politician = politicianResponse.data;
      const mandate = mandateByPolitician.get(politicianId);

      // MdB-Daten zusammenstellen
      const mdbInsert = mapPoliticianToMdb(politician, mandate ?? null);

      // Upsert via abgeordnetenwatch_id
      const result = await upsertMdb(supabase, mdbInsert);
      if (result === 'created') created++;
      if (result === 'updated') updated++;
    } catch (error) {
      console.error(
        `[AW MdB Sync] Fehler bei Politiker ${politicianId}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return { created, updated };
}

/**
 * AW Politician + Mandate auf bundestag_mdb Insert-Shape mappen.
 */
function mapPoliticianToMdb(
  politician: AwPolitician,
  mandate: AwMandate | null,
): MdbInsert {
  // Fraktion ermitteln: aus fraction_membership des Politikers oder des Mandats
  const fraktion = extractFraktion(politician, mandate);

  // Wahlkreis aus den Mandate-Daten
  const wahlkreisId = mandate?.electoral_data?.constituency?.number ?? null;
  const wahlkreisName = mandate?.electoral_data?.constituency?.name ?? null;

  return {
    abgeordnetenwatch_id: String(politician.id),
    name: `${politician.first_name} ${politician.last_name}`,
    vorname: politician.first_name,
    nachname: politician.last_name,
    fraktion,
    wahlkreis_id: wahlkreisId,
    wahlkreis_name: wahlkreisName,
    raw_data: {
      politician: politician as unknown as Record<string, unknown>,
      mandate: mandate as unknown as Record<string, unknown>,
    },
    synced_at: new Date().toISOString(),
  };
}

/**
 * Fraktion aus Politician oder Mandate-Daten extrahieren.
 * Bevorzugt aktive (valid_until === null) Fraktionszugehörigkeiten.
 */
function extractFraktion(
  politician: AwPolitician,
  mandate: AwMandate | null,
): string | null {
  // Zuerst: Fraktionsmitgliedschaft vom Politiker (mit gültig-bis Prüfung)
  if (politician.fraction_membership && politician.fraction_membership.length > 0) {
    // Aktive Mitgliedschaft bevorzugen (valid_until === null)
    const active = politician.fraction_membership.find((fm) => fm.valid_until === null);
    if (active) return active.fraction.label;

    // Fallback: neueste Mitgliedschaft
    const last = politician.fraction_membership[politician.fraction_membership.length - 1];
    return last?.fraction.label ?? null;
  }

  // Fallback: Fraktion aus dem Mandate
  if (mandate?.fraction_membership && mandate.fraction_membership.length > 0) {
    return mandate.fraction_membership[0]?.fraction.label ?? null;
  }

  // Letzter Fallback: Partei des Politikers
  if (politician.party) {
    return politician.party.label;
  }

  return null;
}

/**
 * MdB in die Datenbank upserten via abgeordnetenwatch_id.
 */
async function upsertMdb(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  mdbInsert: MdbInsert,
): Promise<'created' | 'updated' | 'error'> {
  try {
    // Prüfen ob der MdB bereits existiert
    const { data: existing } = await supabase
      .from('bundestag_mdb')
      .select('id')
      .eq('abgeordnetenwatch_id', mdbInsert.abgeordnetenwatch_id)
      .single();

    if (existing) {
      // Update bestehender MdB-Eintrag
      const { error } = await supabase
        .from('bundestag_mdb')
        .update({
          name: mdbInsert.name,
          vorname: mdbInsert.vorname,
          nachname: mdbInsert.nachname,
          fraktion: mdbInsert.fraktion,
          wahlkreis_id: mdbInsert.wahlkreis_id,
          wahlkreis_name: mdbInsert.wahlkreis_name,
          raw_data: mdbInsert.raw_data,
          synced_at: mdbInsert.synced_at,
        })
        .eq('id', existing.id);

      if (error) {
        console.error(
          `[AW MdB Sync] Update fehlgeschlagen (${mdbInsert.abgeordnetenwatch_id}):`,
          error.message,
        );
        return 'error';
      }
      return 'updated';
    }

    // Neuen MdB erstellen
    const { error } = await supabase
      .from('bundestag_mdb')
      .insert(mdbInsert);

    if (error) {
      console.error(
        `[AW MdB Sync] Insert fehlgeschlagen (${mdbInsert.abgeordnetenwatch_id}):`,
        error.message,
      );
      return 'error';
    }
    return 'created';
  } catch (error) {
    console.error(
      `[AW MdB Sync] Fehler bei Upsert (${mdbInsert.abgeordnetenwatch_id}):`,
      error,
    );
    return 'error';
  }
}
