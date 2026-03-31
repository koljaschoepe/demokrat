/**
 * TypeScript interfaces for the abgeordnetenwatch.de API v2.
 * API: https://www.abgeordnetenwatch.de/api/v2/
 * License: CC0 (no auth required)
 */

/** Paginated response wrapper */
export interface AwPaginatedResponse<T> {
  meta: {
    status: string;
    result: {
      count: number;
      total: number;
      range_start: number;
      range_end: number;
    };
  };
  data: T[];
}

/** Single entity response */
export interface AwSingleResponse<T> {
  meta: { status: string };
  data: T;
}

/** AW Poll (Abstimmung) */
export interface AwPoll {
  id: number;
  entity_type: string;
  label: string;
  field_intro: string; // HTML
  field_poll_date: string; // YYYY-MM-DD
  field_accepted: boolean | null;
  field_legislature: { id: number; label: string };
  field_topics: Array<{ id: number; label: string }>;
  related_links?: {
    votes_and_polls?: string; // URL to votes for this poll
  };
}

/** AW Vote (individual MP vote) */
export interface AwVote {
  id: number;
  entity_type: string;
  label: string;
  vote: string; // 'yes', 'no', 'abstain', 'no_show'
  mandate: {
    id: number;
    label: string;
    entity_type: string;
  };
  poll: {
    id: number;
    label: string;
    entity_type: string;
  };
  fraction?: {
    id: number;
    label: string;
  };
}

/** AW Politician */
export interface AwPolitician {
  id: number;
  entity_type: string;
  label: string;
  first_name: string;
  last_name: string;
  sex: string;
  year_of_birth: number | null;
  party: { id: number; label: string } | null;
  fraction_membership?: Array<{
    fraction: { id: number; label: string };
    valid_from: string;
    valid_until: string | null;
  }>;
  electoral_data?: {
    constituency?: { id: number; label: string; number: number } | null;
    list?: { label: string } | null;
  };
  field_title?: string;
}

/** AW Mandate */
export interface AwMandate {
  id: number;
  entity_type: string;
  label: string;
  politician: { id: number; label: string };
  fraction_membership?: Array<{
    fraction: { id: number; label: string };
  }>;
  electoral_data?: {
    constituency?: { number: number; name: string } | null;
  };
}

/** Filter for polls */
export interface AwPollFilter {
  legislature?: number; // e.g., 132 for Bundestag 21
  rangeStart?: number;
  rangeEnd?: number;
}

/** Filter for votes */
export interface AwVoteFilter {
  pollId?: number;
  rangeStart?: number;
  rangeEnd?: number;
}
