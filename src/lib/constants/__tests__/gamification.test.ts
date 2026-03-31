import { describe, it, expect } from 'vitest';
import {
  POINT_VALUES,
  TIER_THRESHOLDS,
  STREAK_MILESTONES,
  SITZUNGSWOCHE_MULTIPLIER,
  SESSION_STEPS,
} from '../gamification';

describe('POINT_VALUES', () => {
  it('all values are positive integers', () => {
    for (const [key, value] of Object.entries(POINT_VALUES)) {
      expect(value, `${key} should be positive`).toBeGreaterThan(0);
      expect(Number.isInteger(value), `${key} should be an integer`).toBe(true);
    }
  });

  it('contains all expected action keys', () => {
    const expectedKeys = [
      'SESSION_BRIEFING',
      'SESSION_QUIZ_CORRECT',
      'SESSION_QUIZ_WRONG',
      'SESSION_VOTE',
      'SESSION_PERSPECTIVE',
      'SESSION_COMPLETE',
      'VOTE_CAST',
      'VOTE_FIRST_TOPIC',
      'COMMENT_CREATE',
      'COMMENT_HIGH_BRIDGING',
      'COMMENT_RATE',
      'TOPIC_CREATE',
      'TOPIC_SUPPORT',
      'REPORT_VALID',
      'STREAK_7',
      'STREAK_30',
      'STREAK_100',
      'STREAK_365',
    ];
    for (const key of expectedKeys) {
      expect(POINT_VALUES).toHaveProperty(key);
    }
  });
});

describe('TIER_THRESHOLDS', () => {
  it('is sorted in ascending order', () => {
    for (let i = 1; i < TIER_THRESHOLDS.length; i++) {
      expect(
        TIER_THRESHOLDS[i]!,
        `Threshold ${i} should be > threshold ${i - 1}`,
      ).toBeGreaterThan(TIER_THRESHOLDS[i - 1]!);
    }
  });

  it('starts at 0', () => {
    expect(TIER_THRESHOLDS[0]).toBe(0);
  });

  it('has exactly 5 tiers (0-4)', () => {
    expect(TIER_THRESHOLDS.length).toBe(5);
  });
});

describe('STREAK_MILESTONES', () => {
  it('is sorted in ascending order', () => {
    for (let i = 1; i < STREAK_MILESTONES.length; i++) {
      expect(
        STREAK_MILESTONES[i]!,
        `Milestone ${i} should be > milestone ${i - 1}`,
      ).toBeGreaterThan(STREAK_MILESTONES[i - 1]!);
    }
  });

  it('all values are positive integers', () => {
    for (const milestone of STREAK_MILESTONES) {
      expect(milestone).toBeGreaterThan(0);
      expect(Number.isInteger(milestone)).toBe(true);
    }
  });

  it('contains the expected milestones', () => {
    expect([...STREAK_MILESTONES]).toEqual([7, 30, 100, 365]);
  });
});

describe('SITZUNGSWOCHE_MULTIPLIER', () => {
  it('is greater than 1', () => {
    expect(SITZUNGSWOCHE_MULTIPLIER).toBeGreaterThan(1);
  });

  it('equals 2', () => {
    expect(SITZUNGSWOCHE_MULTIPLIER).toBe(2);
  });
});

describe('SESSION_STEPS', () => {
  it('is a positive integer', () => {
    expect(SESSION_STEPS).toBeGreaterThan(0);
    expect(Number.isInteger(SESSION_STEPS)).toBe(true);
  });
});
