/**
 * KI-gestützte Nachrichtenlink-Kuratierung für Bundestag-Vorgänge.
 * Schlägt 2-3 Links von vertrauenswürdigen deutschen Quellen vor.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { NEWS_SOURCES_WHITELIST, NEWS_SYSTEM_PROMPT, buildNewsUserPrompt } from '@/lib/prompts/news';
import { chatCompletion, stripCodeFences } from './openai';

interface NewsLink {
  source_name: string;
  title: string;
  url: string;
  published_at: string;
}

const MAX_RETRIES = 2;

/** Erlaubte Domains aus der Whitelist */
const ALLOWED_DOMAINS = NEWS_SOURCES_WHITELIST.map((s) => s.domain);

/**
 * Prüft ob eine URL von einer erlaubten Domain stammt.
 */
function isAllowedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return ALLOWED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

/**
 * Findet das passende Icon für eine Domain aus der Whitelist.
 */
function getSourceIcon(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const source = NEWS_SOURCES_WHITELIST.find(
      (s) => hostname === s.domain || hostname.endsWith(`.${s.domain}`)
    );
    return source?.icon ?? '📰';
  } catch {
    return '📰';
  }
}

/**
 * Parst und validiert die Nachrichtenlink-JSON-Antwort von OpenAI.
 * Filtert ungültige Links heraus.
 */
function parseNewsResponse(raw: string): NewsLink[] {
  const cleaned = stripCodeFences(raw);
  const parsed = JSON.parse(cleaned) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('Invalid news response: expected JSON array');
  }

  const validLinks: NewsLink[] = [];
  for (const item of parsed) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.source_name !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.url !== 'string' ||
      typeof item.published_at !== 'string'
    ) {
      continue;
    }

    // Nur Links von erlaubten Domains akzeptieren
    if (!isAllowedDomain(item.url)) {
      console.warn(`News link rejected — domain not on whitelist: ${item.url}`);
      continue;
    }

    validLinks.push({
      source_name: item.source_name,
      title: item.title,
      url: item.url,
      published_at: item.published_at,
    });
  }

  return validLinks;
}

/**
 * Generiert Nachrichtenlink-Vorschläge für ein Topic und speichert sie in der DB.
 * Gibt die Anzahl der eingefügten Links zurück.
 */
export async function generateNewsLinksForTopic(topicId: string): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Topic mit Summary laden
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('id, title, summary')
    .eq('id', topicId)
    .single();

  if (topicError || !topic) {
    throw new Error(`Topic ${topicId} nicht gefunden`);
  }

  if (!topic.summary) {
    throw new Error(`Topic ${topicId} hat keine Zusammenfassung — Nachrichtensuche nicht möglich`);
  }

  // Zugehörigen Vorgang laden für Sachgebiet und Datum
  const { data: vorgang } = await supabase
    .from('bundestag_vorgaenge')
    .select('sachgebiet, datum')
    .eq('topic_id', topicId)
    .limit(1)
    .single();

  const userPrompt = buildNewsUserPrompt({
    titel: topic.title,
    summary: topic.summary,
    sachgebiet: vorgang?.sachgebiet,
    datum: vorgang?.datum,
  });

  // Nachrichtenlinks generieren mit Retry-Logik
  let links: NewsLink[] = [];
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const raw = await chatCompletion(NEWS_SYSTEM_PROMPT, userPrompt, {
        temperature: 0.4,
        maxTokens: 800,
      });
      links = parseNewsResponse(raw);
      break;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Bei API-Fehlern sofort abbrechen
      if (lastError.message.startsWith('OpenAI API error')) {
        throw lastError;
      }
      console.warn(`News link generation attempt ${attempt + 1} failed: ${lastError.message}`);
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  if (links.length === 0 && lastError) {
    throw new Error(`News link generation failed: ${lastError.message}`);
  }

  if (links.length === 0) return 0;

  // Links in die Datenbank einfügen
  const rows = links.map((link) => ({
    topic_id: topicId,
    source_name: link.source_name,
    source_icon: getSourceIcon(link.url),
    title: link.title,
    url: link.url,
    published_at: link.published_at,
  }));

  const { error: insertError } = await supabase
    .from('topic_news_links')
    .insert(rows);

  if (insertError) {
    throw new Error(`Failed to insert news links: ${insertError.message}`);
  }

  return links.length;
}
