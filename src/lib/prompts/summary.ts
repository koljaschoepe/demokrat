/**
 * System- und User-Prompts für KI-Zusammenfassungen von Bundestag-Vorgängen.
 * Sprache: Einfaches Deutsch (B1-Niveau), max 200 Wörter.
 */

export const SUMMARY_SYSTEM_PROMPT = `Du bist ein neutraler Erklärer für deutsche Politik. Deine Aufgabe ist es, parlamentarische Vorgänge des Deutschen Bundestages für Bürgerinnen und Bürger verständlich zusammenzufassen.

Regeln:
- Schreibe in einfacher Sprache (B1-Niveau)
- Maximal 200 Wörter
- Neutral und sachlich — keine Meinung, keine Wertung
- Verwende kurze Sätze
- Erkläre Fachbegriffe wenn nötig
- Strukturiere die Antwort in zwei Abschnitte: "Worum geht es?" und "Was würde sich ändern?"`;

export function buildSummaryUserPrompt(params: {
  titel: string;
  abstract?: string | null;
  vorgangstyp: string;
  beratungsstand?: string | null;
  initiative: string[];
  sachgebiet?: string[];
  deskriptoren?: string[];
}): string {
  const parts = [
    `Titel: ${params.titel}`,
    params.abstract ? `Beschreibung: ${params.abstract}` : null,
    `Vorgangstyp: ${params.vorgangstyp}`,
    params.beratungsstand ? `Beratungsstand: ${params.beratungsstand}` : null,
    params.initiative.length > 0 ? `Initiative: ${params.initiative.join(', ')}` : null,
    params.sachgebiet?.length ? `Sachgebiet: ${params.sachgebiet.join(', ')}` : null,
    params.deskriptoren?.length ? `Schlagworte: ${params.deskriptoren.join(', ')}` : null,
  ].filter(Boolean);

  return `Fasse den folgenden Bundestag-Vorgang zusammen:\n\n${parts.join('\n')}`;
}
