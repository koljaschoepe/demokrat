import { describe, it, expect } from 'vitest';
import { computeTier } from '../privileges.service';

describe('computeTier', () => {
  // Tier 0: Beobachter (0 points)
  it('returns tier 0 for 0 points', () => {
    expect(computeTier(0)).toBe(0);
  });

  it('returns tier 0 for 49 points (just below tier 1)', () => {
    expect(computeTier(49)).toBe(0);
  });

  // Tier 1: Teilnehmer (50 points)
  it('returns tier 1 for exactly 50 points', () => {
    expect(computeTier(50)).toBe(1);
  });

  it('returns tier 1 for 199 points (just below tier 2)', () => {
    expect(computeTier(199)).toBe(1);
  });

  // Tier 2: Mitwirkender (200 points)
  it('returns tier 2 for exactly 200 points', () => {
    expect(computeTier(200)).toBe(2);
  });

  it('returns tier 2 for 999 points (just below tier 3)', () => {
    expect(computeTier(999)).toBe(2);
  });

  // Tier 3: Moderator (1000 points)
  it('returns tier 3 for exactly 1000 points', () => {
    expect(computeTier(1000)).toBe(3);
  });

  it('returns tier 3 for 4999 points (just below tier 4)', () => {
    expect(computeTier(4999)).toBe(3);
  });

  // Tier 4: Vertrauensperson (5000 points)
  it('returns tier 4 for exactly 5000 points', () => {
    expect(computeTier(5000)).toBe(4);
  });

  it('returns tier 4 for very high point values (99999)', () => {
    expect(computeTier(99999)).toBe(4);
  });
});
