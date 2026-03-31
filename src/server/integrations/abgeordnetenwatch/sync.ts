import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import { createAwClient } from './client';
import type { AbgeordnetenwatchClient } from './client';
import { mapAwPollToAbstimmung, mapAwVoteToMdbVote } from './mappers';

const CACHE_KEY_LAST_SYNC = 'aw:last_sync';
/** Bundestag 21. Legislaturperiode auf abgeordnetenwatch */
const BUNDESTAG_LEGISLATURE_ID = 132;

/** Ergebnis einer Sync-Operation */
export interface SyncResult {
  created: number;
  updated: number;
}

/**
 * Abstimmungen (Polls) für den aktuellen Bundestag synchronisieren.
 * Holt alle Polls der Legislatur 21 (ID=132) und upserted sie in bundestag_abstimmungen.
 */
export async function syncAbstimmungen(): Promise<SyncResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const aw = createAwClient();
  const syncStartTime = new Date().toISOString();

  let created = 0;
  let updated = 0;
  let rangeStart = 0;
  const pageSize = 1000;

  // Alle Polls paginiert abrufen
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await aw.getPolls({
      legislature: BUNDESTAG_LEGISLATURE_ID,
      rangeStart,
      rangeEnd: rangeStart + pageSize - 1,
    });

    for (const poll of response.data) {
      const abstimmungInsert = mapAwPollToAbstimmung(poll);

      // Prüfen ob die Abstimmung bereits existiert
      const { data: existing } = await supabase
        .from('bundestag_abstimmungen')
        .select('id')
        .eq('abgeordnetenwatch_id', String(poll.id))
        .single();

      if (existing) {
        // Update bestehender Abstimmung
        const { error } = await supabase
          .from('bundestag_abstimmungen')
          .update({
            titel: abstimmungInsert.titel,
            datum: abstimmungInsert.datum,
            field_intro: abstimmungInsert.field_intro,
            field_accepted: abstimmungInsert.field_accepted,
            raw_data: abstimmungInsert.raw_data,
            synced_at: abstimmungInsert.synced_at,
          })
          .eq('id', existing.id);

        if (error) {
          console.error(`[AW Sync] Abstimmung Update fehlgeschlagen (${poll.id}):`, error.message);
        } else {
          updated++;
        }
      } else {
        // Neue Abstimmung erstellen — versuche Auto-Linking zu bestehendem Topic
        const topicId = await findMatchingTopic(supabase, abstimmungInsert.titel);

        const { error } = await supabase
          .from('bundestag_abstimmungen')
          .insert({
            ...abstimmungInsert,
            topic_id: topicId,
          });

        if (error) {
          console.error(`[AW Sync] Abstimmung Insert fehlgeschlagen (${poll.id}):`, error.message);
        } else {
          created++;
        }
      }
    }

    // Prüfen ob alle Daten geladen wurden
    const { total, range_end } = response.meta.result;
    if (range_end >= total - 1 || response.data.length === 0) {
      break;
    }

    rangeStart = range_end + 1;
  }

  // Sync-Zeitpunkt in Redis speichern
  await cache.set(CACHE_KEY_LAST_SYNC, syncStartTime);

  return { created, updated };
}

/**
 * Versucht einen bestehenden Topic über Titel-Matching zu finden.
 * Sucht in topics mit source='bundestag' nach ähnlichem Titel.
 */
async function findMatchingTopic(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  abstimmungTitel: string,
): Promise<string | null> {
  // Schlüsselwörter aus dem Titel extrahieren (min. 4 Zeichen, keine Stoppwörter)
  const keywords = abstimmungTitel
    .split(/[\s,;:()[\]{}]+/)
    .filter((word) => word.length >= 4)
    .slice(0, 5); // Max 5 Schlüsselwörter verwenden

  if (keywords.length === 0) return null;

  // Textsuche in topics — exaktes Matching über ilike mit dem ersten Keyword
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title')
    .eq('source', 'bundestag')
    .ilike('title', `%${keywords[0]}%`)
    .limit(10);

  if (!topics || topics.length === 0) return null;

  // Bestes Match finden: Topic mit den meisten übereinstimmenden Schlüsselwörtern
  let bestMatch: { id: string; score: number } | null = null;

  for (const topic of topics as Array<{ id: string; title: string }>) {
    const titleLower = topic.title.toLowerCase();
    const score = keywords.reduce((acc, kw) => {
      return acc + (titleLower.includes(kw.toLowerCase()) ? 1 : 0);
    }, 0);

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { id: topic.id, score };
    }
  }

  // Nur verlinken wenn mindestens 2 Schlüsselwörter übereinstimmen (oder alle bei < 2)
  const threshold = Math.min(2, keywords.length);
  if (bestMatch && bestMatch.score >= threshold) {
    return bestMatch.id;
  }

  return null;
}

/**
 * Einzelstimmen für eine bestimmte Abstimmung synchronisieren.
 * Holt alle Votes von AW, matched die MdBs über abgeordnetenwatch_id und upserted in mdb_votes.
 *
 * @param abstimmungId - Interne UUID der bundestag_abstimmungen
 * @param awPollId - abgeordnetenwatch Poll-ID
 */
export async function syncVotesForAbstimmung(
  abstimmungId: string,
  awPollId: number,
): Promise<SyncResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const aw = createAwClient();

  let created = 0;
  let updated = 0;

  // Alle Votes für diese Abstimmung von AW abrufen
  const votes = await aw.getAllVotesForPoll(awPollId);

  // MdB-Lookup vorbereiten: abgeordnetenwatch Mandate-ID -> interne MdB-ID
  // AW Votes referenzieren Mandates, nicht direkt Politicians
  const mandateIds = [...new Set(votes.map((v) => String(v.mandate.id)))];

  // Alle relevanten MdBs anhand der AW-IDs laden
  // Da wir in der MdB-Tabelle die abgeordnetenwatch_id des Politicians speichern,
  // müssen wir die Mandate erst auflösen
  const mdbLookup = await buildMdbLookup(supabase, aw, mandateIds);

  // Ergebnis-Aggregation vorbereiten
  const ergebnis: Record<string, number> = {
    ja: 0,
    nein: 0,
    enthaltung: 0,
    nicht_abgegeben: 0,
  };

  for (const vote of votes) {
    const mandateId = String(vote.mandate.id);
    const mdbId = mdbLookup.get(mandateId);

    if (!mdbId) {
      // MdB nicht in unserer DB — überspringen
      continue;
    }

    const mdbVote = mapAwVoteToMdbVote(vote, mdbId, abstimmungId);
    ergebnis[mdbVote.vote] = (ergebnis[mdbVote.vote] ?? 0) + 1;

    // Upsert via UNIQUE(mdb_id, abstimmung_id) Constraint
    const { data: existing } = await supabase
      .from('mdb_votes')
      .select('id')
      .eq('mdb_id', mdbId)
      .eq('abstimmung_id', abstimmungId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('mdb_votes')
        .update({
          vote: mdbVote.vote,
          raw_data: mdbVote.raw_data,
        })
        .eq('id', existing.id);

      if (!error) updated++;
    } else {
      const { error } = await supabase
        .from('mdb_votes')
        .insert(mdbVote);

      if (!error) created++;
    }
  }

  // Ergebnis-Aggregation in der Abstimmung speichern
  await supabase
    .from('bundestag_abstimmungen')
    .update({ ergebnis })
    .eq('id', abstimmungId);

  return { created, updated };
}

/**
 * MdB-Lookup aufbauen: AW Mandate-ID -> interne MdB UUID.
 *
 * Strategie: Alle Mandate der aktuellen Legislatur einmalig laden,
 * daraus ein Mapping mandate.id -> politician.id erstellen,
 * und dieses gegen unsere bundestag_mdb Tabelle (abgeordnetenwatch_id = politician.id) matchen.
 *
 * Ergebnis wird in Redis gecached (1h TTL) um wiederholte API-Aufrufe zu vermeiden.
 */
async function buildMdbLookup(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  aw: AbgeordnetenwatchClient,
  _mandateIds: string[],
): Promise<Map<string, string>> {
  const lookup = new Map<string, string>();
  const cacheKey = 'aw:mandate_to_mdb_lookup';

  // Gecachtes Mapping versuchen
  const cached = await cache.get<Record<string, string>>(cacheKey);
  if (cached) {
    for (const [mandateId, mdbId] of Object.entries(cached)) {
      lookup.set(mandateId, mdbId);
    }
    return lookup;
  }

  // Alle MdBs mit abgeordnetenwatch_id aus der DB laden
  const { data: allMdbs } = await supabase
    .from('bundestag_mdb')
    .select('id, abgeordnetenwatch_id');

  if (!allMdbs || (allMdbs as Array<unknown>).length === 0) return lookup;

  // Index: AW Politician-ID (String) -> interne MdB UUID
  const politicianToMdb = new Map<string, string>();
  for (const mdb of allMdbs as Array<{ id: string; abgeordnetenwatch_id: string | null }>) {
    if (mdb.abgeordnetenwatch_id) {
      politicianToMdb.set(mdb.abgeordnetenwatch_id, mdb.id);
    }
  }

  // Alle Mandate der aktuellen Legislatur einmalig laden
  // Jedes Mandate enthält die politician.id — damit können wir das Mapping aufbauen
  const mandates = await aw.getAllMandates(BUNDESTAG_LEGISLATURE_ID);

  for (const mandate of mandates) {
    const politicianId = String(mandate.politician.id);
    const mandateId = String(mandate.id);
    const mdbId = politicianToMdb.get(politicianId);

    if (mdbId) {
      lookup.set(mandateId, mdbId);
    }
  }

  // Lookup in Redis cachen (1 Stunde TTL)
  const cacheObj: Record<string, string> = {};
  for (const [key, value] of lookup.entries()) {
    cacheObj[key] = value;
  }
  await cache.set(cacheKey, cacheObj, 3600);

  return lookup;
}

/**
 * Alle Einzelstimmen für neu synchronisierte Abstimmungen laden.
 * Holt alle Abstimmungen die noch kein Ergebnis haben (ergebnis IS NULL)
 * und synchronisiert deren Votes.
 *
 * @returns Anzahl der insgesamt synchronisierten Votes
 */
export async function syncAllNewVotes(): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Abstimmungen ohne Ergebnis laden — diese brauchen noch Vote-Import
  const { data: abstimmungen } = await supabase
    .from('bundestag_abstimmungen')
    .select('id, abgeordnetenwatch_id')
    .is('ergebnis', null);

  if (!abstimmungen || (abstimmungen as Array<unknown>).length === 0) return 0;

  let totalSynced = 0;

  for (const abstimmung of abstimmungen as Array<{ id: string; abgeordnetenwatch_id: string }>) {
    try {
      const awPollId = parseInt(abstimmung.abgeordnetenwatch_id, 10);
      if (isNaN(awPollId)) continue;

      const result = await syncVotesForAbstimmung(abstimmung.id, awPollId);
      totalSynced += result.created + result.updated;
    } catch (error) {
      console.error(
        `[AW Sync] Votes-Sync für Abstimmung ${abstimmung.id} fehlgeschlagen:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  return totalSynced;
}
