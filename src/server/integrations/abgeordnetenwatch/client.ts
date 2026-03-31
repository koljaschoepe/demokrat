import type {
  AwPoll,
  AwVote,
  AwPolitician,
  AwMandate,
  AwPaginatedResponse,
  AwSingleResponse,
  AwPollFilter,
  AwVoteFilter,
} from './types';

const AW_BASE_URL = 'https://www.abgeordnetenwatch.de/api/v2';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
/** Maximum items per page (AW API limit) */
const PAGE_SIZE = 1000;

/**
 * HTTP client for the abgeordnetenwatch.de API v2.
 * No auth required (CC0 data). Range-based pagination. Retry with exponential backoff.
 */
export class AbgeordnetenwatchClient {
  /**
   * Generic fetch with retry + exponential backoff.
   */
  private async fetchWithRetry<T>(url: string, retries = MAX_RETRIES): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
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
          throw new Error(
            `abgeordnetenwatch API error: ${response.status} ${response.statusText}`,
          );
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

    throw lastError ?? new Error('abgeordnetenwatch API request failed after retries');
  }

  /**
   * Build URL with query parameters, filtering out undefined values.
   */
  private buildUrl(path: string, params: Record<string, string | number | undefined>): string {
    const url = new URL(`${AW_BASE_URL}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  /**
   * Fetch polls (Abstimmungen) with filters.
   */
  async getPolls(filter: AwPollFilter = {}): Promise<AwPaginatedResponse<AwPoll>> {
    const url = this.buildUrl('/polls', {
      'field_legislature': filter.legislature,
      'range_start': filter.rangeStart ?? 0,
      'range_end': filter.rangeEnd ?? (PAGE_SIZE - 1),
    });

    return this.fetchWithRetry<AwPaginatedResponse<AwPoll>>(url);
  }

  /**
   * Fetch a single poll by ID.
   */
  async getPoll(id: number): Promise<AwSingleResponse<AwPoll>> {
    const url = `${AW_BASE_URL}/polls/${id}`;
    return this.fetchWithRetry<AwSingleResponse<AwPoll>>(url);
  }

  /**
   * Fetch votes for a specific poll with pagination.
   */
  async getVotesForPoll(pollId: number, filter: AwVoteFilter = {}): Promise<AwPaginatedResponse<AwVote>> {
    const url = this.buildUrl(`/polls/${pollId}/votes`, {
      'range_start': filter.rangeStart ?? 0,
      'range_end': filter.rangeEnd ?? (PAGE_SIZE - 1),
    });

    return this.fetchWithRetry<AwPaginatedResponse<AwVote>>(url);
  }

  /**
   * Alle Stimmen für eine Abstimmung abrufen (auto-paginiert).
   */
  async getAllVotesForPoll(pollId: number): Promise<AwVote[]> {
    const all: AwVote[] = [];
    let rangeStart = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const rangeEnd = rangeStart + PAGE_SIZE - 1;
      const response = await this.getVotesForPoll(pollId, { rangeStart, rangeEnd });

      all.push(...response.data);

      // Prüfen ob alle Daten geladen wurden
      const { total, range_end } = response.meta.result;
      if (range_end >= total - 1 || response.data.length === 0) {
        break;
      }

      rangeStart = range_end + 1;
    }

    return all;
  }

  /**
   * Fetch a single politician by ID.
   */
  async getPolitician(id: number): Promise<AwSingleResponse<AwPolitician>> {
    const url = `${AW_BASE_URL}/politicians/${id}`;
    return this.fetchWithRetry<AwSingleResponse<AwPolitician>>(url);
  }

  /**
   * Fetch mandates for a legislature period.
   */
  async getMandates(
    legislatureId: number,
    filter: { rangeStart?: number; rangeEnd?: number } = {},
  ): Promise<AwPaginatedResponse<AwMandate>> {
    const url = this.buildUrl(`/legislatures/${legislatureId}/mandates`, {
      'range_start': filter.rangeStart ?? 0,
      'range_end': filter.rangeEnd ?? (PAGE_SIZE - 1),
    });

    return this.fetchWithRetry<AwPaginatedResponse<AwMandate>>(url);
  }

  /**
   * Alle Mandate einer Legislatur abrufen (auto-paginiert).
   */
  async getAllMandates(legislatureId: number): Promise<AwMandate[]> {
    const all: AwMandate[] = [];
    let rangeStart = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const rangeEnd = rangeStart + PAGE_SIZE - 1;
      const response = await this.getMandates(legislatureId, { rangeStart, rangeEnd });

      all.push(...response.data);

      // Prüfen ob alle Daten geladen wurden
      const { total, range_end } = response.meta.result;
      if (range_end >= total - 1 || response.data.length === 0) {
        break;
      }

      rangeStart = range_end + 1;
    }

    return all;
  }
}

/**
 * Create an abgeordnetenwatch client instance.
 * No API key required — CC0 public data.
 */
export function createAwClient(): AbgeordnetenwatchClient {
  return new AbgeordnetenwatchClient();
}
