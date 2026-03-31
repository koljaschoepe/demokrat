/**
 * TypeScript interfaces for the DIP (Dokumentations- und Informationssystem) API.
 * API Docs: https://search.dip.bundestag.de/api/v1
 */

/** Pagination cursor from DIP API */
export interface DipPaginationCursor {
  cursor: string;
}

/** Standard paginated response wrapper */
export interface DipPaginatedResponse<T> {
  documents: T[];
  numFound: number;
  cursor: string;
}

/** DIP Vorgang (Parliamentary Proceeding) */
export interface DipVorgang {
  id: string;
  typ: string;
  wahlperiode: number;
  titel: string;
  initiative: string[];
  datum: string;
  aktualisiert: string;
  abstract?: string;
  sachgebiet?: string[];
  deskriptor?: Array<{ name: string; typ: string }>;
  vorgangstyp: string;
  beratungsstand?: string;
  zustimmungsbeduerftigkeit?: string[];
  wichtpigesDrucksache?: DipDrucksacheRef;
  verkuendung?: Array<{ jahrgang: string; seite: string }>;
  vorgangsbezug?: Array<{ id: string; titel: string; vorgangstyp: string }>;
  fundstelle: DipFundstelle;
}

/** DIP Drucksache Reference */
export interface DipDrucksacheRef {
  id: string;
  dokumentnummer: string;
  dokumentart: string;
  datum: string;
  titel?: string;
  pdf_url?: string;
}

/** DIP Drucksache (Printed Document) */
export interface DipDrucksache {
  id: string;
  typ: string;
  dokumentnummer: string;
  wahlperiode: number;
  datum: string;
  titel: string;
  autoren_anzeige?: string;
  fundstelle: DipFundstelle;
  pdf_url?: string;
}

/** DIP Fundstelle */
export interface DipFundstelle {
  pdf_url?: string;
  dokumentnummer?: string;
  drucksachetyp?: string;
  datum: string;
}

/** DIP Person */
export interface DipPerson {
  id: string;
  nachname: string;
  vorname: string;
  titel?: string;
  wahlperiode: number;
  basisdatum?: string;
}

/** DIP Aktivitaet (Activity on a Vorgang) */
export interface DipAktivitaet {
  id: string;
  typ: string;
  dokumentart: string;
  datum: string;
  titel: string;
  vorgangsbezug_anzahl: number;
  fundstelle: DipFundstelle;
}

/** Filter parameters for Vorgang queries */
export interface DipVorgangFilter {
  wahlperiode?: number;
  aktualisiertStart?: string; // ISO date
  aktualisiertEnd?: string;
  vorgangstyp?: string;
  sachgebiet?: string;
  cursor?: string;
}

/** Filter for Drucksache queries */
export interface DipDrucksacheFilter {
  wahlperiode?: number;
  dokumentnummer?: string;
  cursor?: string;
}
