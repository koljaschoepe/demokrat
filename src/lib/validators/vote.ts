/**
 * Phase 070 — Zod validation schemas for vote operations
 */

import { z } from 'zod/v4';

/** Schema for casting a new vote */
export const castVoteSchema = z.object({
  topicId: z.string().uuid(),
  choice: z.string().min(1, 'Auswahl ist erforderlich'),
});

/** Schema for changing an existing vote */
export const changeVoteSchema = z.object({
  topicId: z.string().uuid(),
  newChoice: z.string().min(1, 'Neue Auswahl ist erforderlich'),
});

/** Schema for revoking a vote */
export const revokeVoteSchema = z.object({
  topicId: z.string().uuid(),
});

/** Schema for querying a user's current vote on a topic */
export const myVoteSchema = z.object({
  topicId: z.string().uuid(),
});

/** Schema for querying vote results */
export const voteResultsSchema = z.object({
  topicId: z.string().uuid(),
});

/** Schema for querying citizen vs. Bundestag comparison */
export const voteComparisonSchema = z.object({
  topicId: z.string().uuid(),
});

export type CastVoteInput = z.infer<typeof castVoteSchema>;
export type ChangeVoteInput = z.infer<typeof changeVoteSchema>;
export type RevokeVoteInput = z.infer<typeof revokeVoteSchema>;
export type MyVoteInput = z.infer<typeof myVoteSchema>;
export type VoteResultsInput = z.infer<typeof voteResultsSchema>;
export type VoteComparisonInput = z.infer<typeof voteComparisonSchema>;
