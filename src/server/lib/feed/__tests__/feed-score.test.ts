import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeFeedScore, scoreFeedTopics, type FeedTopic } from '../score';
import {
  BOOST_ACTIVE_WINDOW,
  BOOST_CATEGORY_MATCH,
  BOOST_WAHLKREIS,
  BOOST_ENGAGEMENT_VELOCITY,
  BOOST_SITZUNGSWOCHE,
  HALF_LIFE_HOURS,
} from '../constants';

/** Helper: creates a FeedTopic with sensible defaults */
function makeTopic(overrides: Partial<FeedTopic> = {}): FeedTopic {
  return {
    id: 'topic-1',
    title: 'Test-Thema',
    source: 'BUNDESTAG',
    category: 'gesundheit',
    status: 'active',
    vote_count: 10,
    comment_count: 5,
    closes_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    wahlkreis_id: null,
    recent_votes_24h: 0,
    recent_comments_24h: 0,
    ...overrides,
  };
}

describe('computeFeedScore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns score close to 1.0 for brand new topic (no boosts)', () => {
    const topic = makeTopic({
      created_at: new Date().toISOString(),
      vote_count: 0,
      comment_count: 0,
    });
    const score = computeFeedScore(topic);
    // Decay for age 0 = 0.5^(0/48) = 1.0; multiplier = 1+0 = 1.0
    expect(score).toBeCloseTo(1.0, 2);
  });

  it('returns ~0.5 for topic aged exactly one half-life (48h)', () => {
    const ageMs = HALF_LIFE_HOURS * 60 * 60 * 1000;
    const topic = makeTopic({
      created_at: new Date(Date.now() - ageMs).toISOString(),
      vote_count: 0,
      comment_count: 0,
    });
    const score = computeFeedScore(topic);
    expect(score).toBeCloseTo(0.5, 2);
  });

  it('applies active voting window boost', () => {
    const topic = makeTopic({
      closes_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1h from now
      vote_count: 0,
      comment_count: 0,
    });
    const score = computeFeedScore(topic);
    // decay ~1.0, boost = BOOST_ACTIVE_WINDOW -> score = 1.0 * (1 + 1.0) = 2.0
    expect(score).toBeCloseTo(1 + BOOST_ACTIVE_WINDOW, 1);
  });

  it('applies category match boost', () => {
    const topic = makeTopic({
      category: 'gesundheit',
      vote_count: 0,
      comment_count: 0,
    });
    const score = computeFeedScore(
      topic,
      { categories: ['gesundheit', 'bildung'] },
    );
    expect(score).toBeCloseTo(1 + BOOST_CATEGORY_MATCH, 1);
  });

  it('applies wahlkreis match boost', () => {
    const topic = makeTopic({
      wahlkreis_id: 'wk-42',
      vote_count: 0,
      comment_count: 0,
    });
    const score = computeFeedScore(
      topic,
      { wahlkreis_id: 'wk-42' },
    );
    expect(score).toBeCloseTo(1 + BOOST_WAHLKREIS, 1);
  });

  it('applies engagement velocity boost when ratio > 0.1', () => {
    const topic = makeTopic({
      vote_count: 10,
      comment_count: 10,
      recent_votes_24h: 5,
      recent_comments_24h: 5,
    });
    // recentActivity = 10, totalActivity = 20, ratio = 0.5 > 0.1 -> boost
    const score = computeFeedScore(topic);
    expect(score).toBeCloseTo(1 + BOOST_ENGAGEMENT_VELOCITY, 1);
  });

  it('does NOT apply engagement velocity boost when ratio <= 0.1', () => {
    const topic = makeTopic({
      vote_count: 50,
      comment_count: 50,
      recent_votes_24h: 2,
      recent_comments_24h: 3,
    });
    // recentActivity = 5, totalActivity = 100, ratio = 0.05 <= 0.1 -> no boost
    const score = computeFeedScore(topic);
    expect(score).toBeCloseTo(1.0, 1);
  });

  it('applies sitzungswoche boost', () => {
    const topic = makeTopic({
      vote_count: 0,
      comment_count: 0,
    });
    const score = computeFeedScore(topic, undefined, true);
    expect(score).toBeCloseTo(1 + BOOST_SITZUNGSWOCHE, 1);
  });

  it('stacks multiple boosts additively', () => {
    const topic = makeTopic({
      category: 'gesundheit',
      wahlkreis_id: 'wk-42',
      closes_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      vote_count: 10,
      comment_count: 10,
      recent_votes_24h: 5,
      recent_comments_24h: 5,
    });
    const prefs = { categories: ['gesundheit'], wahlkreis_id: 'wk-42' };
    const score = computeFeedScore(topic, prefs, true);
    const expectedBoost =
      BOOST_ACTIVE_WINDOW +
      BOOST_CATEGORY_MATCH +
      BOOST_WAHLKREIS +
      BOOST_ENGAGEMENT_VELOCITY +
      BOOST_SITZUNGSWOCHE;
    // decay ~1.0 for brand new topic
    expect(score).toBeCloseTo(1 + expectedBoost, 1);
  });

  it('returns pure decay with no boosts', () => {
    const ageHours = 24;
    const ageMs = ageHours * 60 * 60 * 1000;
    const topic = makeTopic({
      created_at: new Date(Date.now() - ageMs).toISOString(),
      vote_count: 0,
      comment_count: 0,
    });
    const score = computeFeedScore(topic);
    const expectedDecay = Math.pow(0.5, ageHours / HALF_LIFE_HOURS);
    expect(score).toBeCloseTo(expectedDecay, 4);
  });

  it('does not apply category boost when categories list is empty', () => {
    const topic = makeTopic({
      category: 'gesundheit',
      vote_count: 0,
      comment_count: 0,
    });
    const score = computeFeedScore(topic, { categories: [] });
    expect(score).toBeCloseTo(1.0, 1);
  });

  it('does not apply wahlkreis boost when topic has no wahlkreis', () => {
    const topic = makeTopic({
      wahlkreis_id: null,
      vote_count: 0,
      comment_count: 0,
    });
    const score = computeFeedScore(topic, { wahlkreis_id: 'wk-42' });
    expect(score).toBeCloseTo(1.0, 1);
  });
});

describe('scoreFeedTopics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sorts topics by score descending', () => {
    const topics: FeedTopic[] = [
      makeTopic({
        id: 'old',
        created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
        vote_count: 0,
        comment_count: 0,
      }),
      makeTopic({
        id: 'new',
        created_at: new Date().toISOString(),
        vote_count: 0,
        comment_count: 0,
      }),
      makeTopic({
        id: 'middle',
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        vote_count: 0,
        comment_count: 0,
      }),
    ];

    const scored = scoreFeedTopics(topics);

    expect(scored[0]!.id).toBe('new');
    expect(scored[1]!.id).toBe('middle');
    expect(scored[2]!.id).toBe('old');

    // Verify descending order
    for (let i = 1; i < scored.length; i++) {
      expect(scored[i - 1]!.score).toBeGreaterThanOrEqual(scored[i]!.score);
    }
  });

  it('attaches score property to each topic', () => {
    const topics = [makeTopic()];
    const scored = scoreFeedTopics(topics);
    expect(scored[0]).toHaveProperty('score');
    expect(typeof scored[0]!.score).toBe('number');
  });
});
