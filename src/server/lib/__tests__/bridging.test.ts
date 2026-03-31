import { describe, it, expect } from 'vitest';
import { computeBridgingScore, type BridgingRating } from '../bridging';

describe('computeBridgingScore', () => {
  it('returns null for empty array', () => {
    expect(computeBridgingScore([])).toBeNull();
  });

  it('returns null when no upvotes from yes/no voters', () => {
    const ratings: BridgingRating[] = [
      { voter_position: 'abstain', rating: 'up' },
      { voter_position: null, rating: 'up' },
    ];
    expect(computeBridgingScore(ratings)).toBeNull();
  });

  it('returns 0 when only yes-voters upvote', () => {
    const ratings: BridgingRating[] = [
      { voter_position: 'yes', rating: 'up' },
      { voter_position: 'yes', rating: 'up' },
    ];
    expect(computeBridgingScore(ratings)).toBe(0);
  });

  it('returns 0 when only no-voters upvote', () => {
    const ratings: BridgingRating[] = [
      { voter_position: 'no', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
    ];
    expect(computeBridgingScore(ratings)).toBe(0);
  });

  it('returns 1.0 for perfect bridging (equal yes/no upvotes)', () => {
    const ratings: BridgingRating[] = [
      { voter_position: 'yes', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
    ];
    expect(computeBridgingScore(ratings)).toBe(1.0);
  });

  it('returns 0.33 for asymmetric bridging (3 yes, 1 no)', () => {
    const ratings: BridgingRating[] = [
      { voter_position: 'yes', rating: 'up' },
      { voter_position: 'yes', rating: 'up' },
      { voter_position: 'yes', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
    ];
    expect(computeBridgingScore(ratings)).toBe(0.33);
  });

  it('ignores downvotes entirely', () => {
    const ratings: BridgingRating[] = [
      { voter_position: 'yes', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
      { voter_position: 'yes', rating: 'down' },
      { voter_position: 'no', rating: 'down' },
      { voter_position: 'yes', rating: 'down' },
    ];
    // Only upvotes count: 1 yes, 1 no -> perfect bridging
    expect(computeBridgingScore(ratings)).toBe(1.0);
  });

  it('ignores abstain and null voter positions', () => {
    const ratings: BridgingRating[] = [
      { voter_position: 'yes', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
      { voter_position: 'abstain', rating: 'up' },
      { voter_position: null, rating: 'up' },
    ];
    // abstain and null are ignored: 1 yes, 1 no -> perfect bridging
    expect(computeBridgingScore(ratings)).toBe(1.0);
  });

  it('computes correct result with mixed ratings', () => {
    const ratings: BridgingRating[] = [
      { voter_position: 'yes', rating: 'up' },
      { voter_position: 'yes', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
      { voter_position: 'yes', rating: 'down' },
      { voter_position: 'no', rating: 'down' },
      { voter_position: 'abstain', rating: 'up' },
      { voter_position: null, rating: 'up' },
    ];
    // Upvotes only: 2 yes, 3 no -> min(2,3)/max(2,3) = 2/3 = 0.67
    expect(computeBridgingScore(ratings)).toBe(0.67);
  });

  it('handles single upvote from each side', () => {
    const ratings: BridgingRating[] = [
      { voter_position: 'yes', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
    ];
    expect(computeBridgingScore(ratings)).toBe(1.0);
  });

  it('rounds to two decimal places', () => {
    // 1 yes, 3 no -> 1/3 = 0.3333... -> 0.33
    const ratings: BridgingRating[] = [
      { voter_position: 'yes', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
      { voter_position: 'no', rating: 'up' },
    ];
    expect(computeBridgingScore(ratings)).toBe(0.33);
  });
});
