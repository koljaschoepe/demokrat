'use client';

import { FeedbackLoopSteps } from '@/components/feedback-loop/feedback-loop-steps';

/**
 * Phase 163 — Feedback Loop (Impact Page Integration)
 *
 * Wrapper for the FeedbackLoopSteps component used on the impact page.
 * Shows default state (user has voted, waiting for wahlkreis result).
 */
export function FeedbackLoop() {
  // In the future, this would fetch real data for the user's most recent vote
  return (
    <FeedbackLoopSteps
      topicData={{
        hasVoted: true,
        hasWahlkreisResult: false,
        mdbEmailSent: false,
        bundestagVoted: false,
      }}
    />
  );
}
