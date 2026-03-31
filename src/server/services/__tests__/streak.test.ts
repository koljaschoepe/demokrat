import { describe, it, expect } from 'vitest';
import { getTodayCET, getYesterdayCET } from '../streak.service';

describe('getTodayCET', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const today = getTodayCET();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns a valid date', () => {
    const today = getTodayCET();
    const parsed = new Date(today + 'T12:00:00Z');
    expect(parsed.getTime()).not.toBeNaN();
  });
});

describe('getYesterdayCET', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const yesterday = getYesterdayCET();
    expect(yesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns a date before getTodayCET', () => {
    const today = getTodayCET();
    const yesterday = getYesterdayCET();
    const todayDate = new Date(today + 'T12:00:00Z');
    const yesterdayDate = new Date(yesterday + 'T12:00:00Z');
    expect(yesterdayDate.getTime()).toBeLessThan(todayDate.getTime());
  });

  it('returns a date exactly one day before today (in most cases)', () => {
    const today = getTodayCET();
    const yesterday = getYesterdayCET();
    const todayDate = new Date(today + 'T12:00:00Z');
    const yesterdayDate = new Date(yesterday + 'T12:00:00Z');
    const diffMs = todayDate.getTime() - yesterdayDate.getTime();
    const diffDays = diffMs / (24 * 60 * 60 * 1000);
    // Should be 1 day apart (may be slightly off during DST transitions)
    expect(diffDays).toBeCloseTo(1, 0);
  });
});
