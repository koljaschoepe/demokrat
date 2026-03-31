import type { DipVorgang } from './types';

/**
 * Mapping von DIP-Sachgebieten auf die 10 App-Kategorien.
 * Jedes DIP-Sachgebiet wird dem nächstpassenden App-Bereich zugeordnet.
 */
const SACHGEBIET_TO_CATEGORY: Record<string, string> = {
  // Umwelt & Klima
  'Umwelt': 'umwelt',
  'Umweltschutz': 'umwelt',
  'Naturschutz': 'umwelt',
  'Klimaschutz': 'umwelt',
  'Energie': 'umwelt',
  'Energiewirtschaft': 'umwelt',
  'Tierschutz': 'umwelt',
  'Reaktorsicherheit und Strahlenschutz': 'umwelt',
  'Abfallwirtschaft': 'umwelt',

  // Wirtschaft
  'Wirtschaft': 'wirtschaft',
  'Wirtschaftspolitik': 'wirtschaft',
  'Außenwirtschaft': 'wirtschaft',
  'Mittelstand': 'wirtschaft',
  'Handwerk': 'wirtschaft',
  'Industrie': 'wirtschaft',
  'Tourismus': 'wirtschaft',
  'Verbraucherschutz': 'wirtschaft',
  'Wettbewerbspolitik': 'wirtschaft',
  'Landwirtschaft und Ernährung': 'wirtschaft',
  'Landwirtschaft': 'wirtschaft',
  'Ernährung': 'wirtschaft',

  // Bildung
  'Bildung': 'bildung',
  'Bildung und Erziehung': 'bildung',
  'Wissenschaft, Forschung und Technologie': 'bildung',
  'Wissenschaft': 'bildung',
  'Forschung': 'bildung',
  'Hochschule': 'bildung',
  'Kulturpolitik': 'bildung',
  'Kultur': 'bildung',
  'Medien, Kommunikation und Informationstechnik': 'bildung',
  'Sport': 'bildung',

  // Gesundheit
  'Gesundheit': 'gesundheit',
  'Gesundheitspolitik': 'gesundheit',
  'Gesundheitswesen': 'gesundheit',
  'Krankenversicherung': 'gesundheit',
  'Arzneimittelwesen': 'gesundheit',
  'Drogenpolitik': 'gesundheit',
  'Pflege': 'gesundheit',
  'Pflegeversicherung': 'gesundheit',

  // Digitales
  'Digitalisierung': 'digitales',
  'Informationstechnik': 'digitales',
  'Datenschutz': 'digitales',
  'Telekommunikation': 'digitales',
  'Neue Technologien': 'digitales',

  // Soziales
  'Soziale Sicherung': 'soziales',
  'Sozialversicherung': 'soziales',
  'Sozialpolitik': 'soziales',
  'Arbeit und Beschäftigung': 'soziales',
  'Arbeit': 'soziales',
  'Arbeitsmarktpolitik': 'soziales',
  'Rentenversicherung': 'soziales',
  'Rente': 'soziales',
  'Familie': 'soziales',
  'Familienpolitik': 'soziales',
  'Frauen': 'soziales',
  'Gleichstellung': 'soziales',
  'Jugend': 'soziales',
  'Senioren': 'soziales',
  'Menschen mit Behinderungen': 'soziales',
  'Gesellschaftspolitik, soziale Gruppen': 'soziales',
  'Zuwanderung': 'soziales',
  'Migration': 'soziales',
  'Integration': 'soziales',

  // Sicherheit
  'Innere Sicherheit': 'sicherheit',
  'Verteidigung': 'sicherheit',
  'Polizei': 'sicherheit',
  'Recht': 'sicherheit',
  'Rechtspolitik': 'sicherheit',
  'Strafrecht': 'sicherheit',
  'Zivilrecht': 'sicherheit',
  'Öffentliches Recht': 'sicherheit',
  'Verkehr': 'sicherheit',
  'Verkehrspolitik': 'sicherheit',
  'Straßenverkehr': 'sicherheit',
  'Katastrophenschutz': 'sicherheit',

  // Finanzen
  'Öffentliche Finanzen, Steuern und Abgaben': 'finanzen',
  'Finanzen': 'finanzen',
  'Finanzpolitik': 'finanzen',
  'Steuern': 'finanzen',
  'Steuerpolitik': 'finanzen',
  'Haushalt': 'finanzen',
  'Haushaltsrecht': 'finanzen',
  'Bundeshaushalt': 'finanzen',
  'Bankenwesen': 'finanzen',
  'Geld und Währung': 'finanzen',

  // Wohnen
  'Raumordnung, Bau- und Wohnungswesen': 'wohnen',
  'Wohnungswesen': 'wohnen',
  'Bauwesen': 'wohnen',
  'Stadtentwicklung': 'wohnen',
  'Mietrecht': 'wohnen',

  // Europa & Internationales
  'Europapolitik und Europäische Union': 'europa',
  'Europapolitik': 'europa',
  'Auswärtige Politik': 'europa',
  'Außenpolitik': 'europa',
  'Internationale Beziehungen': 'europa',
  'Entwicklungspolitik': 'europa',
  'Menschenrechte': 'europa',
  'Vereinte Nationen': 'europa',
  'NATO': 'europa',
};

/** Gültige App-Kategorien */
export type AppCategory =
  | 'umwelt'
  | 'wirtschaft'
  | 'bildung'
  | 'gesundheit'
  | 'digitales'
  | 'soziales'
  | 'sicherheit'
  | 'finanzen'
  | 'wohnen'
  | 'europa'
  | 'sonstiges';

/**
 * Sachgebiet auf App-Kategorie mappen.
 * Probiert zuerst exaktes Matching, dann Teilstring-Matching.
 */
export function mapSachgebietToCategory(sachgebiet: string): AppCategory {
  // Exaktes Matching
  const direct = SACHGEBIET_TO_CATEGORY[sachgebiet];
  if (direct) return direct as AppCategory;

  // Teilstring-Matching: prüfe ob das Sachgebiet einen bekannten Schlüssel enthält
  const normalizedInput = sachgebiet.toLowerCase();
  for (const [key, category] of Object.entries(SACHGEBIET_TO_CATEGORY)) {
    if (normalizedInput.includes(key.toLowerCase())) {
      return category as AppCategory;
    }
  }

  return 'sonstiges';
}

/**
 * Erstes Sachgebiet eines Vorgangs auf die App-Kategorie mappen.
 */
export function mapVorgangCategory(vorgang: DipVorgang): AppCategory {
  if (!vorgang.sachgebiet || vorgang.sachgebiet.length === 0) {
    return 'sonstiges';
  }

  // Erstes Sachgebiet ist in der Regel das relevanteste
  const first = vorgang.sachgebiet[0];
  if (!first) return 'sonstiges';
  return mapSachgebietToCategory(first);
}

/**
 * Beratungsstand auf Topic-Status mappen.
 * DIP-Beratungsstände werden auf unsere vereinfachten Statuswerte abgebildet.
 */
export function mapBeratungsstandToStatus(beratungsstand?: string): string {
  if (!beratungsstand) return 'draft';

  const mapping: Record<string, string> = {
    'Noch nicht beraten': 'active',
    'Überwiesen': 'active',
    'Beschlussempfehlung liegt vor': 'active',
    'Dem Bundesrat zugeleitet': 'active',
    'Den Ausschüssen zugewiesen': 'active',
    'Im Ausschuss beraten': 'active',
    'Angenommen': 'voting_closed',
    'Abgelehnt': 'voting_closed',
    'Abgeschlossen': 'voting_closed',
    'Erledigt durch Ablauf der Wahlperiode': 'voting_closed',
    'Verkündet': 'voting_closed',
    'Zurückgezogen': 'voting_closed',
    'Für erledigt erklärt': 'voting_closed',
    'Nicht ausgefertigt (Einspruch des Bundespräsidenten)': 'voting_closed',
  };

  return mapping[beratungsstand] ?? 'draft';
}

/** Shape für bundestag_vorgaenge DB-Insert */
export interface VorgangInsert {
  dip_id: string;
  titel: string;
  abstract: string | null;
  sachgebiet: string[];
  vorgangstyp: string;
  beratungsstand: string | null;
  initiative: string[];
  datum: string;
  aktualisiert: string;
  deskriptor: string[];
  raw_data: Record<string, unknown>;
  synced_at: string;
}

/** Shape für topics DB-Insert (aus einem Vorgang erstellt) */
export interface TopicFromVorgangInsert {
  title: string;
  description: string | null;
  summary: string | null;
  source: 'bundestag';
  source_id: string;
  category: string;
  status: string;
}

/**
 * DIP-Vorgang auf bundestag_vorgaenge Insert-Shape mappen.
 */
export function mapVorgangToDbInsert(vorgang: DipVorgang): VorgangInsert {
  return {
    dip_id: vorgang.id,
    titel: vorgang.titel,
    abstract: vorgang.abstract ?? null,
    sachgebiet: vorgang.sachgebiet ?? [],
    vorgangstyp: vorgang.vorgangstyp,
    beratungsstand: vorgang.beratungsstand ?? null,
    initiative: vorgang.initiative ?? [],
    datum: vorgang.datum,
    aktualisiert: vorgang.aktualisiert,
    deskriptor: (vorgang.deskriptor ?? []).map((d) => d.name),
    raw_data: vorgang as unknown as Record<string, unknown>,
    synced_at: new Date().toISOString(),
  };
}

/**
 * DIP-Vorgang auf topics Insert-Shape mappen.
 * Erstellt einen Topic-Eintrag mit source='bundestag'.
 */
export function mapVorgangToTopicInsert(vorgang: DipVorgang): TopicFromVorgangInsert {
  const category = mapVorgangCategory(vorgang);
  const status = mapBeratungsstandToStatus(vorgang.beratungsstand);

  return {
    title: vorgang.titel,
    description: vorgang.abstract ?? null,
    summary: vorgang.abstract
      ? vorgang.abstract.substring(0, 300) + (vorgang.abstract.length > 300 ? '...' : '')
      : null,
    source: 'bundestag',
    source_id: vorgang.id,
    category,
    status,
  };
}
