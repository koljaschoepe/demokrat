import type { AwPoll, AwVote } from './types';

/** Vote-Label-Mapping: AW-Werte auf deutsche DB-Werte */
const VOTE_LABEL_MAP: Record<string, string> = {
  'yes': 'ja',
  'no': 'nein',
  'abstain': 'enthaltung',
  'no_show': 'nicht_abgegeben',
};

/** Shape für bundestag_abstimmungen DB-Insert */
export interface AbstimmungInsert {
  abgeordnetenwatch_id: string;
  titel: string;
  datum: string;
  ergebnis: Record<string, unknown> | null;
  field_intro: string | null;
  field_accepted: boolean | null;
  raw_data: Record<string, unknown>;
  synced_at: string;
}

/** Shape für mdb_votes DB-Insert */
export interface MdbVoteInsert {
  mdb_id: string;
  abstimmung_id: string;
  vote: string;
  raw_data: Record<string, unknown>;
}

/**
 * HTML-Tags aus einem String entfernen.
 * Einfache Implementierung für die field_intro-Felder von AW.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // HTML-Tags entfernen
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ') // Mehrfache Whitespace zusammenfassen
    .trim();
}

/**
 * AW Vote-Label auf deutschen DB-Wert mappen.
 * Gibt 'nicht_abgegeben' zurück wenn der Wert unbekannt ist.
 */
export function mapVoteLabel(vote: string): string {
  return VOTE_LABEL_MAP[vote] ?? 'nicht_abgegeben';
}

/**
 * AW Poll auf bundestag_abstimmungen Insert-Shape mappen.
 */
export function mapAwPollToAbstimmung(poll: AwPoll): AbstimmungInsert {
  return {
    abgeordnetenwatch_id: String(poll.id),
    titel: poll.label,
    datum: poll.field_poll_date,
    ergebnis: null, // Wird nach dem Vote-Import aggregiert
    field_intro: poll.field_intro ? stripHtml(poll.field_intro) : null,
    field_accepted: poll.field_accepted,
    raw_data: poll as unknown as Record<string, unknown>,
    synced_at: new Date().toISOString(),
  };
}

/**
 * AW Vote auf mdb_votes Insert-Shape mappen.
 */
export function mapAwVoteToMdbVote(
  vote: AwVote,
  mdbId: string,
  abstimmungId: string,
): MdbVoteInsert {
  return {
    mdb_id: mdbId,
    abstimmung_id: abstimmungId,
    vote: mapVoteLabel(vote.vote),
    raw_data: vote as unknown as Record<string, unknown>,
  };
}
