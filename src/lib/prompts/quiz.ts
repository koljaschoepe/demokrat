/**
 * System- und User-Prompts für KI-generierte Quiz-Fragen.
 * Multiple Choice: 4 Optionen, genau 1 korrekt.
 */

export const QUIZ_SYSTEM_PROMPT = `Du bist ein Quiz-Ersteller für eine deutsche Demokratie-App. Erstelle eine Multiple-Choice-Frage zu einem Bundestag-Vorgang.

Regeln:
- Genau 4 Antwortmöglichkeiten (A, B, C, D)
- Genau 1 korrekte Antwort
- Einfache Sprache (B1-Niveau)
- Die Frage soll das Verständnis des Vorgangs testen, nicht Detailwissen
- Keine Fangfragen
- Kurze, klare Formulierungen

Antworte im folgenden JSON-Format (NUR JSON, kein Markdown):
{
  "question": "Die Frage",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_index": 0,
  "explanation": "Kurze Erklärung warum die Antwort richtig ist (1-2 Sätze)"
}`;

export function buildQuizUserPrompt(params: {
  titel: string;
  summary: string;
  vorgangstyp: string;
  sachgebiet?: string[];
}): string {
  const parts = [
    `Titel: ${params.titel}`,
    `Zusammenfassung: ${params.summary}`,
    `Vorgangstyp: ${params.vorgangstyp}`,
    params.sachgebiet?.length ? `Sachgebiet: ${params.sachgebiet.join(', ')}` : null,
  ].filter(Boolean);

  return `Erstelle eine Quiz-Frage zu folgendem Bundestag-Vorgang:\n\n${parts.join('\n')}`;
}
