/**
 * Prompts für KI-gestützte Nachrichtenlink-Vorschläge.
 * Whitelist: nur seriöse deutsche Nachrichtenquellen.
 */

export const NEWS_SOURCES_WHITELIST = [
  { name: 'tagesschau.de', domain: 'tagesschau.de', icon: '📺' },
  { name: 'ZEIT ONLINE', domain: 'zeit.de', icon: '📰' },
  { name: 'FAZ', domain: 'faz.net', icon: '📰' },
  { name: 'Spiegel', domain: 'spiegel.de', icon: '📰' },
  { name: 'Süddeutsche Zeitung', domain: 'sueddeutsche.de', icon: '📰' },
  { name: 'Deutschlandfunk', domain: 'deutschlandfunk.de', icon: '🎙️' },
  { name: 'Bundestag.de', domain: 'bundestag.de', icon: '🏛️' },
  { name: 'Bundesregierung.de', domain: 'bundesregierung.de', icon: '🏛️' },
] as const;

export type NewsSource = (typeof NEWS_SOURCES_WHITELIST)[number];

export const NEWS_SYSTEM_PROMPT = `Du bist ein Nachrichtenrechercheur für eine deutsche Demokratie-App. Deine Aufgabe ist es, 2-3 relevante Nachrichtenlinks zu einem Bundestag-Vorgang vorzuschlagen.

Erlaubte Quellen (NUR diese Domains):
- tagesschau.de
- zeit.de
- faz.net
- spiegel.de
- sueddeutsche.de
- deutschlandfunk.de
- bundestag.de
- bundesregierung.de

Regeln:
- Genau 2-3 Links
- Nur seriöse, verifizierbare Quellen von den erlaubten Domains
- Möglichst aktuelle Artikel
- Unterschiedliche Perspektiven bevorzugen
- WICHTIG: Schlage nur Links vor, die WAHRSCHEINLICH existieren (basierend auf deinem Wissen)

Antworte im folgenden JSON-Format (NUR JSON, kein Markdown):
[
  {
    "source_name": "tagesschau.de",
    "title": "Artikeltitel",
    "url": "https://www.tagesschau.de/...",
    "published_at": "2026-03-15"
  }
]`;

export function buildNewsUserPrompt(params: {
  titel: string;
  summary: string;
  sachgebiet?: string[];
  datum?: string;
}): string {
  const parts = [
    `Vorgang: ${params.titel}`,
    `Zusammenfassung: ${params.summary}`,
    params.sachgebiet?.length ? `Sachgebiet: ${params.sachgebiet.join(', ')}` : null,
    params.datum ? `Datum: ${params.datum}` : null,
  ].filter(Boolean);

  return `Finde 2-3 Nachrichtenlinks zu folgendem Bundestag-Vorgang:\n\n${parts.join('\n')}`;
}
