import type {
  DipVorgang,
  DipDrucksache,
  DipPerson,
  DipPaginatedResponse,
  DipVorgangFilter,
  DipDrucksacheFilter,
} from './types';

const DIP_BASE_URL = 'https://search.dip.bundestag.de/api/v1';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * HTTP client for the Bundestag DIP API.
 * Auth via ApiKey header. Cursor-based pagination. Retry with exponential backoff.
 */
export class DipClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generic fetch with retry + exponential backoff.
   */
  private async fetchWithRetry<T>(url: string, retries = MAX_RETRIES): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'ApiKey': this.apiKey,
            'Accept': 'application/json',
          },
        });

        if (response.status === 429) {
          // Rate limited — wait and retry
          const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        if (!response.ok) {
          throw new Error(`DIP API error: ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries - 1) {
          const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }

    throw lastError ?? new Error('DIP API request failed after retries');
  }

  /**
   * Build URL with query parameters, filtering out undefined values.
   */
  private buildUrl(path: string, params: Record<string, string | number | undefined>): string {
    const url = new URL(`${DIP_BASE_URL}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  /**
   * Fetch Vorgänge (parliamentary proceedings) with filters.
   */
  async getVorgaenge(filter: DipVorgangFilter = {}): Promise<DipPaginatedResponse<DipVorgang>> {
    const url = this.buildUrl('/vorgang', {
      'f.wahlperiode': filter.wahlperiode,
      'f.aktualisiert.start': filter.aktualisiertStart,
      'f.aktualisiert.end': filter.aktualisiertEnd,
      'f.vorgangstyp': filter.vorgangstyp,
      'f.sachgebiet': filter.sachgebiet,
      cursor: filter.cursor,
    });

    return this.fetchWithRetry<DipPaginatedResponse<DipVorgang>>(url);
  }

  /**
   * Fetch all Vorgänge by auto-paginating through cursor.
   */
  async getAllVorgaenge(filter: Omit<DipVorgangFilter, 'cursor'> = {}): Promise<DipVorgang[]> {
    const all: DipVorgang[] = [];
    let cursor: string | undefined;

    do {
      const response = await this.getVorgaenge({ ...filter, cursor });
      all.push(...response.documents);
      cursor = response.cursor || undefined;
    } while (cursor);

    return all;
  }

  /**
   * Fetch a single Vorgang by ID.
   */
  async getVorgang(id: string): Promise<DipVorgang> {
    const url = `${DIP_BASE_URL}/vorgang/${encodeURIComponent(id)}`;
    return this.fetchWithRetry<DipVorgang>(url);
  }

  /**
   * Fetch Drucksachen (printed documents).
   */
  async getDrucksachen(filter: DipDrucksacheFilter = {}): Promise<DipPaginatedResponse<DipDrucksache>> {
    const url = this.buildUrl('/drucksache', {
      'f.wahlperiode': filter.wahlperiode,
      'f.dokumentnummer': filter.dokumentnummer,
      cursor: filter.cursor,
    });

    return this.fetchWithRetry<DipPaginatedResponse<DipDrucksache>>(url);
  }

  /**
   * Fetch a single Drucksache by ID.
   */
  async getDrucksache(id: string): Promise<DipDrucksache> {
    const url = `${DIP_BASE_URL}/drucksache/${encodeURIComponent(id)}`;
    return this.fetchWithRetry<DipDrucksache>(url);
  }

  /**
   * Fetch a Person by ID.
   */
  async getPerson(id: string): Promise<DipPerson> {
    const url = `${DIP_BASE_URL}/person/${encodeURIComponent(id)}`;
    return this.fetchWithRetry<DipPerson>(url);
  }
}

/**
 * Create a DIP client instance using the environment API key.
 */
export function createDipClient(): DipClient {
  const apiKey = process.env.DIP_API_KEY;
  if (!apiKey) {
    throw new Error('DIP_API_KEY environment variable is not set');
  }
  return new DipClient(apiKey);
}
