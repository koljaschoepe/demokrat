-- ============================================================================
-- DEMOKRAT - Combined Database Migration + Seed
-- ============================================================================
-- This file contains ALL 31 migrations concatenated in order, followed by
-- the seed data. Paste this entire file into the Supabase SQL Editor to set
-- up the full database schema in one step.
--
-- Generated from: supabase/migrations/20260331000001..000031 + seed.sql
-- ============================================================================


-- ============================================
-- Migration: 20260331000001_baseline.sql
-- ============================================

-- Phase 017: Baseline Migration
-- Extensions for crypto and trigram search

CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA extensions;


-- ============================================
-- Migration: 20260331000002_wahlkreise.sql
-- ============================================

-- Phase 018: Wahlkreise (Electoral Districts)

CREATE TABLE wahlkreise (
  id INTEGER PRIMARY KEY, -- Official WK-Number 1-299
  name TEXT NOT NULL,
  bundesland TEXT NOT NULL,
  geometry JSONB -- GeoJSON for map display
);

-- Index for Bundesland filtering
CREATE INDEX idx_wahlkreise_bundesland ON wahlkreise (bundesland);


-- ============================================
-- Migration: 20260331000003_profiles.sql
-- ============================================

-- Phase 019: Profiles + RLS

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  wahlkreis_id INTEGER REFERENCES wahlkreise(id),
  bio TEXT,
  avatar_url TEXT,
  verification_tier TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_tier IN ('unverified', 'verified', 'identity_verified')),
  reputation_points INTEGER NOT NULL DEFAULT 0,
  privilege_tier INTEGER NOT NULL DEFAULT 0
    CHECK (privilege_tier BETWEEN 0 AND 4),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_wahlkreis ON profiles (wahlkreis_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (is_public = true OR id = auth.uid());

CREATE POLICY profiles_insert ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (id = auth.uid());


-- ============================================
-- Migration: 20260331000004_user_preferences.sql
-- ============================================

-- Phase 020: User Preferences + RLS

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  categories TEXT[] DEFAULT '{}',
  notification_votes BOOLEAN NOT NULL DEFAULT true,
  notification_comments BOOLEAN NOT NULL DEFAULT true,
  notification_results BOOLEAN NOT NULL DEFAULT true,
  theme TEXT NOT NULL DEFAULT 'system',
  language TEXT NOT NULL DEFAULT 'de',
  daily_goal INTEGER NOT NULL DEFAULT 3,
  font_size TEXT NOT NULL DEFAULT 'medium'
    CHECK (font_size IN ('small', 'medium', 'large')),
  high_contrast BOOLEAN NOT NULL DEFAULT false,
  reduced_motion BOOLEAN NOT NULL DEFAULT false,
  art9_consent_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_preferences_select ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY user_preferences_insert ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_preferences_update ON user_preferences FOR UPDATE
  USING (user_id = auth.uid());


-- ============================================
-- Migration: 20260331000005_topics.sql
-- ============================================

-- Phase 021: Topics + Indexes + RLS

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  summary TEXT,
  source TEXT NOT NULL CHECK (source IN ('bundestag', 'user')),
  source_id TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'active', 'voting_closed', 'archived')),
  voting_format TEXT NOT NULL
    CHECK (voting_format IN ('yes_no', 'multiple_choice', 'ranked_choice', 'approval', 'budget')),
  voting_config JSONB NOT NULL DEFAULT '{}',
  voting_opens_at TIMESTAMPTZ,
  voting_closes_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  supporter_count INTEGER NOT NULL DEFAULT 0,
  vote_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feed queries
CREATE INDEX idx_topics_feed ON topics (status, created_at DESC);
-- Source lookup
CREATE INDEX idx_topics_source ON topics (source, source_id);
-- Category filtering
CREATE INDEX idx_topics_category ON topics (category);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY topics_select ON topics FOR SELECT
  USING (status != 'draft' OR created_by = auth.uid());

CREATE POLICY topics_insert ON topics FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY topics_update ON topics FOR UPDATE
  USING (created_by = auth.uid());


-- ============================================
-- Migration: 20260331000006_topic_tags_supporters.sql
-- ============================================

-- Phase 022: Topic Tags & Supporters

CREATE TABLE topic_tags (
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (topic_id, tag)
);

CREATE INDEX idx_topic_tags_tag ON topic_tags (tag);

CREATE TABLE topic_supporters (
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (topic_id, user_id)
);

ALTER TABLE topic_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_supporters ENABLE ROW LEVEL SECURITY;

-- Tags: readable by all authenticated users
CREATE POLICY topic_tags_select ON topic_tags FOR SELECT
  USING (true);

CREATE POLICY topic_tags_insert ON topic_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM topics WHERE id = topic_id AND created_by = auth.uid()
  ));

CREATE POLICY topic_tags_delete ON topic_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM topics WHERE id = topic_id AND created_by = auth.uid()
  ));

-- Supporters: publicly readable, own insertable/deletable
CREATE POLICY supporters_select ON topic_supporters FOR SELECT
  USING (true);

CREATE POLICY supporters_insert ON topic_supporters FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY supporters_delete ON topic_supporters FOR DELETE
  USING (user_id = auth.uid());

-- Trigger: update supporter_count on topics
CREATE OR REPLACE FUNCTION update_supporter_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topics SET supporter_count = supporter_count + 1
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topics SET supporter_count = supporter_count - 1
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_supporter_count
AFTER INSERT OR DELETE ON topic_supporters
FOR EACH ROW EXECUTE FUNCTION update_supporter_count();


-- ============================================
-- Migration: 20260331000007_topic_news_links.sql
-- ============================================

-- Phase 023: Topic News Links

CREATE TABLE topic_news_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_icon TEXT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_links_topic ON topic_news_links (topic_id);

ALTER TABLE topic_news_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY news_links_select ON topic_news_links FOR SELECT
  USING (true);


-- ============================================
-- Migration: 20260331000008_bundestag_vorgaenge.sql
-- ============================================

-- Phase 024: Bundestag Vorgaenge (Parliamentary Proceedings)

CREATE TABLE bundestag_vorgaenge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dip_id TEXT UNIQUE NOT NULL,
  titel TEXT,
  abstract TEXT,
  sachgebiet TEXT[],
  vorgangstyp TEXT,
  beratungsstand TEXT,
  initiative TEXT[],
  datum DATE,
  aktualisiert TIMESTAMPTZ,
  deskriptor TEXT[],
  raw_data JSONB,
  topic_id UUID REFERENCES topics(id),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vorgaenge_dip ON bundestag_vorgaenge (dip_id);
CREATE INDEX idx_vorgaenge_topic ON bundestag_vorgaenge (topic_id);


-- ============================================
-- Migration: 20260331000009_bundestag_abstimmungen.sql
-- ============================================

-- Phase 025: Bundestag Abstimmungen (Parliamentary Votes)

CREATE TABLE bundestag_abstimmungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  abgeordnetenwatch_id TEXT UNIQUE,
  topic_id UUID REFERENCES topics(id),
  titel TEXT,
  datum DATE,
  ergebnis JSONB,
  field_intro TEXT,
  field_accepted BOOLEAN,
  raw_data JSONB,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_abstimmungen_aw ON bundestag_abstimmungen (abgeordnetenwatch_id);
CREATE INDEX idx_abstimmungen_topic ON bundestag_abstimmungen (topic_id);


-- ============================================
-- Migration: 20260331000010_bundestag_mdb.sql
-- ============================================

-- Phase 026: MdB Stammdaten (Members of Parliament)

CREATE TABLE bundestag_mdb (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dip_person_id TEXT,
  abgeordnetenwatch_id TEXT,
  name TEXT NOT NULL,
  vorname TEXT,
  nachname TEXT,
  fraktion TEXT,
  wahlkreis_id INTEGER REFERENCES wahlkreise(id),
  wahlkreis_name TEXT,
  foto_url TEXT,
  raw_data JSONB,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mdb_wahlkreis ON bundestag_mdb (wahlkreis_id);
CREATE INDEX idx_mdb_fraktion ON bundestag_mdb (fraktion);
CREATE UNIQUE INDEX idx_mdb_dip_person ON bundestag_mdb (dip_person_id) WHERE dip_person_id IS NOT NULL;
CREATE UNIQUE INDEX idx_mdb_aw ON bundestag_mdb (abgeordnetenwatch_id) WHERE abgeordnetenwatch_id IS NOT NULL;


-- ============================================
-- Migration: 20260331000011_mdb_votes.sql
-- ============================================

-- Phase 027: MdB Einzelstimmen (Individual MP Votes)

CREATE TABLE mdb_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mdb_id UUID NOT NULL REFERENCES bundestag_mdb(id) ON DELETE CASCADE,
  abstimmung_id UUID NOT NULL REFERENCES bundestag_abstimmungen(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('ja', 'nein', 'enthaltung', 'nicht_abgegeben')),
  raw_data JSONB,
  UNIQUE (mdb_id, abstimmung_id)
);

CREATE INDEX idx_mdb_votes_abstimmung ON mdb_votes (abstimmung_id);


-- ============================================
-- Migration: 20260331000012_vote_events.sql
-- ============================================

-- Phase 028: Vote Events (Append-Only Event Store)

CREATE TABLE vote_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES topics(id),
  event_type TEXT NOT NULL
    CHECK (event_type IN ('VoteCast', 'VoteChanged', 'VoteRevoked', 'DelegationSet', 'DelegationRevoked')),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  payload JSONB NOT NULL,
  prev_hash TEXT,
  event_hash TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sequence_number BIGINT GENERATED ALWAYS AS IDENTITY
);

-- Stream replay index
CREATE INDEX idx_vote_events_stream ON vote_events (stream_id, sequence_number);

-- Prevent double voting: only one active VoteCast per user per topic
CREATE UNIQUE INDEX idx_vote_events_user_topic ON vote_events (user_id, stream_id)
  WHERE event_type = 'VoteCast';

-- User vote history
CREATE INDEX idx_vote_events_user ON vote_events (user_id, created_at DESC);

-- Append-only rules: prevent updates and deletes
CREATE RULE vote_events_no_update AS ON UPDATE TO vote_events DO INSTEAD NOTHING;
CREATE RULE vote_events_no_delete AS ON DELETE TO vote_events DO INSTEAD NOTHING;

ALTER TABLE vote_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own votes
CREATE POLICY vote_events_insert ON vote_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can read their own votes
CREATE POLICY vote_events_select ON vote_events FOR SELECT
  USING (user_id = auth.uid());


-- ============================================
-- Migration: 20260331000013_vote_results.sql
-- ============================================

-- Phase 029: Vote Results (Read Model Projection)

CREATE TABLE vote_results (
  topic_id UUID PRIMARY KEY REFERENCES topics(id),
  total_votes INTEGER NOT NULL DEFAULT 0,
  results JSONB NOT NULL DEFAULT '{}',
  demographic_breakdown JSONB,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE vote_results ENABLE ROW LEVEL SECURITY;

-- Publicly readable
CREATE POLICY vote_results_select ON vote_results FOR SELECT
  USING (true);


-- ============================================
-- Migration: 20260331000014_comments.sql
-- ============================================

-- Phase 030: Comments + RLS

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  position TEXT CHECK (position IN ('pro', 'contra', 'neutral')),
  sources TEXT[],
  bridging_score FLOAT NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bridging sort (default)
CREATE INDEX idx_comments_bridging ON comments (topic_id, bridging_score DESC);
-- Chronological sort
CREATE INDEX idx_comments_chrono ON comments (topic_id, created_at DESC);
-- Author lookup
CREATE INDEX idx_comments_author ON comments (author_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Hidden comments only visible to author
CREATE POLICY comments_select ON comments FOR SELECT
  USING (is_hidden = false OR author_id = auth.uid());

CREATE POLICY comments_insert ON comments FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Can only update own comments within 15 minutes
CREATE POLICY comments_update ON comments FOR UPDATE
  USING (author_id = auth.uid() AND created_at > now() - INTERVAL '15 minutes');


-- ============================================
-- Migration: 20260331000015_comment_ratings.sql
-- ============================================

-- Phase 031: Comment Ratings

CREATE TABLE comment_ratings (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating IN (-1, 0, 1)),
  voter_position TEXT CHECK (voter_position IN ('pro', 'contra', 'neutral')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

ALTER TABLE comment_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY ratings_select ON comment_ratings FOR SELECT
  USING (true);

CREATE POLICY ratings_insert ON comment_ratings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ratings_update ON comment_ratings FOR UPDATE
  USING (user_id = auth.uid());

-- Trigger: update upvotes/downvotes counters on comments
CREATE OR REPLACE FUNCTION update_comment_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.rating = 1 THEN
      UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.rating = -1 THEN
      UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Decrement old
    IF OLD.rating = 1 THEN
      UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
    ELSIF OLD.rating = -1 THEN
      UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
    END IF;
    -- Increment new
    IF NEW.rating = 1 THEN
      UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.rating = -1 THEN
      UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.rating = 1 THEN
      UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
    ELSIF OLD.rating = -1 THEN
      UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_comment_vote_counts
AFTER INSERT OR UPDATE OR DELETE ON comment_ratings
FOR EACH ROW EXECUTE FUNCTION update_comment_vote_counts();


-- ============================================
-- Migration: 20260331000016_reputation_events.sql
-- ============================================

-- Phase 032: Reputation Events

CREATE TABLE reputation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotency: prevent duplicate point awards for same action on same reference
CREATE UNIQUE INDEX idx_reputation_idempotent
  ON reputation_events (user_id, action, reference_type, reference_id)
  WHERE reference_id IS NOT NULL;

CREATE INDEX idx_reputation_user ON reputation_events (user_id, created_at DESC);

ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY reputation_select ON reputation_events FOR SELECT
  USING (user_id = auth.uid());


-- ============================================
-- Migration: 20260331000017_badges.sql
-- ============================================

-- Phase 033: Badges & User Badges

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  criteria JSONB NOT NULL
);

CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Badges are publicly readable
CREATE POLICY badges_select ON badges FOR SELECT
  USING (true);

-- User badges: own badges readable, publicly visible on public profiles
CREATE POLICY user_badges_select ON user_badges FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = user_id AND is_public = true
    )
  );


-- ============================================
-- Migration: 20260331000018_groups.sql
-- ============================================

-- Phase 034: Groups & Group Members

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('party', 'faction', 'interest', 'custom')),
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Public groups readable by all; private only by members
CREATE POLICY groups_select ON groups FOR SELECT
  USING (
    visibility = 'public'
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY groups_insert ON groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Group members: visible if group is visible
CREATE POLICY group_members_select ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_id
      AND (visibility = 'public' OR EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY group_members_insert ON group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY group_members_delete ON group_members FOR DELETE
  USING (user_id = auth.uid());

-- Trigger: update member_count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET member_count = member_count + 1
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET member_count = member_count - 1
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_group_member_count
AFTER INSERT OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION update_group_member_count();


-- ============================================
-- Migration: 20260331000019_reports.sql
-- ============================================

-- Phase 035: Reports + RLS

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('comment', 'topic', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'confirmed', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports (status);
CREATE INDEX idx_reports_target ON reports (target_type, target_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Own reports readable
CREATE POLICY reports_select_own ON reports FOR SELECT
  USING (reporter_id = auth.uid());

-- Moderators (privilege_tier >= 3) can read all
CREATE POLICY reports_select_moderator ON reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND privilege_tier >= 3
  ));

CREATE POLICY reports_insert ON reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- Moderators can update status
CREATE POLICY reports_update_moderator ON reports FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND privilege_tier >= 3
  ));


-- ============================================
-- Migration: 20260331000020_audit_log.sql
-- ============================================

-- Phase 036: Audit Log + RLS

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_actor ON audit_log (actor_id);
CREATE INDEX idx_audit_log_target ON audit_log (target_type, target_id);
CREATE INDEX idx_audit_log_created ON audit_log (created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins (privilege_tier >= 4) can read
CREATE POLICY audit_log_select ON audit_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND privilege_tier >= 4
  ));


-- ============================================
-- Migration: 20260331000021_notifications.sql
-- ============================================

-- Phase 037: Notifications + Index

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'new_vote',
    'vote_result',
    'bundestag_result',
    'comment_reply',
    'bridging_achievement',
    'streak_milestone',
    'quest_complete',
    'wahlkreis_update',
    'mdb_voted',
    'topic_activated',
    'system'
  )),
  title TEXT NOT NULL,
  body TEXT,
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary query: unread notifications for user, newest first
CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY notifications_update ON notifications FOR UPDATE
  USING (user_id = auth.uid());


-- ============================================
-- Migration: 20260331000022_streaks_activity.sql
-- ============================================

-- Phase 038: Streaks & Daily Activity

CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  streak_shields INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE daily_activity (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  voted BOOLEAN NOT NULL DEFAULT false,
  read_summary BOOLEAN NOT NULL DEFAULT false,
  quiz_passed BOOLEAN NOT NULL DEFAULT false,
  commented BOOLEAN NOT NULL DEFAULT false,
  rated BOOLEAN NOT NULL DEFAULT false,
  points_earned INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY streaks_select ON user_streaks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY streaks_insert ON user_streaks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY streaks_update ON user_streaks FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY activity_select ON daily_activity FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY activity_insert ON daily_activity FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY activity_update ON daily_activity FOR UPDATE
  USING (user_id = auth.uid());


-- ============================================
-- Migration: 20260331000023_session_content.sql
-- ============================================

-- Phase 039: Session Content & Daily Sessions

CREATE TABLE session_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_date DATE NOT NULL UNIQUE,
  topic_id UUID REFERENCES topics(id),
  briefing TEXT NOT NULL,
  quiz_question TEXT NOT NULL,
  quiz_options JSONB NOT NULL,
  quiz_explanation TEXT,
  bridging_comment_id UUID REFERENCES comments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE daily_sessions (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  step_reached INTEGER NOT NULL DEFAULT 0 CHECK (step_reached BETWEEN 0 AND 5),
  completed BOOLEAN NOT NULL DEFAULT false,
  points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, session_date)
);

ALTER TABLE session_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;

-- Session content: publicly readable
CREATE POLICY session_content_select ON session_content FOR SELECT
  USING (true);

-- Daily sessions: own data only
CREATE POLICY daily_sessions_select ON daily_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY daily_sessions_insert ON daily_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY daily_sessions_update ON daily_sessions FOR UPDATE
  USING (user_id = auth.uid());


-- ============================================
-- Migration: 20260331000024_platform_metrics.sql
-- ============================================

-- Phase 040: Platform Metrics & Wahlkreis Stats

CREATE TABLE platform_metrics (
  metric_date DATE PRIMARY KEY,
  active_users_today INTEGER NOT NULL DEFAULT 0,
  votes_today INTEGER NOT NULL DEFAULT 0,
  avg_bridging_score FLOAT NOT NULL DEFAULT 0,
  active_wahlkreise INTEGER NOT NULL DEFAULT 0,
  diversity_index FLOAT NOT NULL DEFAULT 0,
  mdb_emails_sent INTEGER NOT NULL DEFAULT 0,
  puls_score FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wahlkreis_stats (
  wahlkreis_id INTEGER PRIMARY KEY REFERENCES wahlkreise(id),
  registered_users INTEGER NOT NULL DEFAULT 0,
  active_users_week INTEGER NOT NULL DEFAULT 0,
  votes_week INTEGER NOT NULL DEFAULT 0,
  avg_bridging_score FLOAT NOT NULL DEFAULT 0,
  category_diversity INTEGER NOT NULL DEFAULT 0,
  mdb_emails_sent INTEGER NOT NULL DEFAULT 0,
  fortschritt_stufe INTEGER NOT NULL DEFAULT 1 CHECK (fortschritt_stufe BETWEEN 1 AND 5),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wahlkreis_stats ENABLE ROW LEVEL SECURITY;

-- Publicly readable
CREATE POLICY platform_metrics_select ON platform_metrics FOR SELECT
  USING (true);

CREATE POLICY wahlkreis_stats_select ON wahlkreis_stats FOR SELECT
  USING (true);


-- ============================================
-- Migration: 20260331000025_fulltext_triggers_functions.sql
-- ============================================

-- Phase 041: Full-text Search, Triggers & DB Functions

-- =============================================================
-- 1. German full-text search index on topics
-- =============================================================
CREATE INDEX idx_topics_search ON topics
  USING GIN (to_tsvector('german', coalesce(title, '') || ' ' || coalesce(description, '')));

-- =============================================================
-- 2. Vote Results Projection Trigger
-- =============================================================
CREATE OR REPLACE FUNCTION update_vote_results()
RETURNS TRIGGER AS $$
DECLARE
  current_results JSONB;
  choice TEXT;
  old_choice TEXT;
BEGIN
  -- Get the choice from payload
  choice := NEW.payload->>'choice';

  -- Ensure vote_results row exists
  INSERT INTO vote_results (topic_id, total_votes, results)
  VALUES (NEW.stream_id, 0, '{}')
  ON CONFLICT (topic_id) DO NOTHING;

  IF NEW.event_type = 'VoteCast' THEN
    UPDATE vote_results
    SET
      total_votes = total_votes + 1,
      results = jsonb_set(
        results,
        ARRAY[choice],
        to_jsonb(COALESCE((results->>choice)::int, 0) + 1)
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

    -- Update topic vote_count
    UPDATE topics SET vote_count = vote_count + 1
    WHERE id = NEW.stream_id;

  ELSIF NEW.event_type = 'VoteChanged' THEN
    old_choice := NEW.payload->>'old_choice';
    UPDATE vote_results
    SET
      results = jsonb_set(
        jsonb_set(
          results,
          ARRAY[old_choice],
          to_jsonb(GREATEST(COALESCE((results->>old_choice)::int, 0) - 1, 0))
        ),
        ARRAY[choice],
        to_jsonb(COALESCE((results->>choice)::int, 0) + 1)
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

  ELSIF NEW.event_type = 'VoteRevoked' THEN
    old_choice := NEW.payload->>'old_choice';
    UPDATE vote_results
    SET
      total_votes = GREATEST(total_votes - 1, 0),
      results = jsonb_set(
        results,
        ARRAY[COALESCE(old_choice, choice)],
        to_jsonb(GREATEST(COALESCE((results->>COALESCE(old_choice, choice))::int, 0) - 1, 0))
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

    -- Update topic vote_count
    UPDATE topics SET vote_count = GREATEST(vote_count - 1, 0)
    WHERE id = NEW.stream_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_vote_results
AFTER INSERT ON vote_events
FOR EACH ROW EXECUTE FUNCTION update_vote_results();

-- =============================================================
-- 3. Auto-Activate Topic when supporter_count >= threshold
-- =============================================================
CREATE OR REPLACE FUNCTION auto_activate_topic()
RETURNS TRIGGER AS $$
DECLARE
  threshold INTEGER := 10; -- Configurable threshold
BEGIN
  IF NEW.supporter_count >= threshold AND NEW.status = 'pending' THEN
    NEW.status := 'active';
    NEW.voting_opens_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auto_activate_topic
BEFORE UPDATE OF supporter_count ON topics
FOR EACH ROW EXECUTE FUNCTION auto_activate_topic();

-- =============================================================
-- 4. Generic updated_at trigger function
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_wahlkreis_stats_updated_at
  BEFORE UPDATE ON wahlkreis_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- 5. Comment flagging on report confirmation
-- =============================================================
CREATE OR REPLACE FUNCTION flag_reported_comment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND NEW.target_type = 'comment' THEN
    UPDATE comments SET is_flagged = true WHERE id = NEW.target_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_flag_reported_comment
AFTER UPDATE OF status ON reports
FOR EACH ROW
WHEN (NEW.status = 'confirmed')
EXECUTE FUNCTION flag_reported_comment();

-- =============================================================
-- 6. Enable Supabase Realtime for vote_results
-- =============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE vote_results;

-- =============================================================
-- 7. Update comment_count on topics when comments change
-- =============================================================
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topics SET comment_count = comment_count + 1
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topics SET comment_count = comment_count - 1
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();


-- ============================================
-- Migration: 20260331000026_sitzungswochen.sql
-- ============================================

-- Phase 056: Sitzungswochen (Parliamentary Session Weeks)

CREATE TABLE sitzungswochen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_sitzungswochen_dates ON sitzungswochen (start_date, end_date);
CREATE INDEX idx_sitzungswochen_active ON sitzungswochen (is_active) WHERE is_active = true;


-- ============================================
-- Migration: 20260331000027_vote_results_trigger.sql
-- ============================================

-- Phase 069 — Vote Results Projection Trigger (improved version)
--
-- Replaces the basic trigger from migration 000025 with a more robust version.
-- Handles VoteCast, VoteChanged, VoteRevoked with safe JSONB manipulation.

-- Drop existing trigger if present (from migration 000025)
DROP TRIGGER IF EXISTS trg_vote_results ON vote_events;

CREATE OR REPLACE FUNCTION update_vote_results()
RETURNS TRIGGER AS $$
DECLARE
  v_choice TEXT;
  v_old_choice TEXT;
  v_new_choice TEXT;
BEGIN
  -- Ensure a vote_results row exists for this topic
  INSERT INTO vote_results (topic_id, total_votes, results)
  VALUES (NEW.stream_id, 0, '{}'::jsonb)
  ON CONFLICT (topic_id) DO NOTHING;

  IF NEW.event_type = 'VoteCast' THEN
    -- Extract choice from payload
    v_choice := NEW.payload->>'choice';

    IF v_choice IS NULL THEN
      RAISE WARNING 'VoteCast event missing choice in payload, event_id: %', NEW.event_id;
      RETURN NEW;
    END IF;

    -- Increment total_votes and the specific choice count
    UPDATE vote_results
    SET
      total_votes = total_votes + 1,
      results = jsonb_set(
        results,
        ARRAY[v_choice],
        to_jsonb(COALESCE((results->>v_choice)::int, 0) + 1)
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

    -- Keep topics.vote_count in sync
    UPDATE topics SET vote_count = vote_count + 1
    WHERE id = NEW.stream_id;

  ELSIF NEW.event_type = 'VoteChanged' THEN
    -- Extract old and new choices from payload
    v_old_choice := NEW.payload->>'old_choice';
    v_new_choice := NEW.payload->>'new_choice';

    IF v_old_choice IS NULL OR v_new_choice IS NULL THEN
      RAISE WARNING 'VoteChanged event missing old_choice or new_choice, event_id: %', NEW.event_id;
      RETURN NEW;
    END IF;

    -- Decrement old choice, increment new choice; total_votes unchanged
    UPDATE vote_results
    SET
      results = jsonb_set(
        jsonb_set(
          results,
          ARRAY[v_old_choice],
          to_jsonb(GREATEST(COALESCE((results->>v_old_choice)::int, 0) - 1, 0))
        ),
        ARRAY[v_new_choice],
        -- Must re-read from the intermediate result for new_choice
        -- Since jsonb_set returns a new JSONB, if new_choice == old_choice this is a no-op
        to_jsonb(
          CASE
            WHEN v_new_choice = v_old_choice THEN COALESCE((results->>v_new_choice)::int, 0)
            ELSE COALESCE((results->>v_new_choice)::int, 0) + 1
          END
        )
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

    -- topics.vote_count stays unchanged for VoteChanged

  ELSIF NEW.event_type = 'VoteRevoked' THEN
    -- Extract the revoked choice from payload
    v_choice := NEW.payload->>'choice';

    IF v_choice IS NULL THEN
      RAISE WARNING 'VoteRevoked event missing choice in payload, event_id: %', NEW.event_id;
      RETURN NEW;
    END IF;

    -- Decrement total_votes and the specific choice count
    UPDATE vote_results
    SET
      total_votes = GREATEST(total_votes - 1, 0),
      results = jsonb_set(
        results,
        ARRAY[v_choice],
        to_jsonb(GREATEST(COALESCE((results->>v_choice)::int, 0) - 1, 0))
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

    -- Keep topics.vote_count in sync
    UPDATE topics SET vote_count = GREATEST(vote_count - 1, 0)
    WHERE id = NEW.stream_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER trg_vote_results
AFTER INSERT ON vote_events
FOR EACH ROW EXECUTE FUNCTION update_vote_results();


-- ============================================
-- Migration: 20260331000028_sync_runs.sql
-- ============================================

-- Phase 169: Sync Runs tracking table
CREATE TABLE IF NOT EXISTS public.sync_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('dip', 'abgeordnetenwatch', 'meilisearch', 'content')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'failed')),
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_sync_runs_source ON public.sync_runs (source);
CREATE INDEX idx_sync_runs_started_at ON public.sync_runs (started_at DESC);

ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;

-- Only admins can read sync runs
CREATE POLICY "Admins can read sync runs"
  ON public.sync_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND privilege_tier >= 3
    )
  );


-- ============================================
-- Migration: 20260331000029_feature_flags.sql
-- ============================================

-- Phase 173: Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Anyone can read flags (needed for client-side checks)
CREATE POLICY "Anyone can read feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update feature flags"
  ON public.feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND privilege_tier >= 4
    )
  );

-- Seed default flags
INSERT INTO public.feature_flags (id, name, description, enabled, rollout_percentage) VALUES
  ('sitzungswoche', 'Sitzungswoche Modus', 'Aktiviert spezielle UI-Elemente waehrend der Sitzungswochen', true, 100),
  ('ai-summaries', 'KI-Zusammenfassungen', 'Generiert automatische Zusammenfassungen', true, 100),
  ('quiz', 'Quiz-Fragen', 'Zeigt Wissensquiz-Fragen zu politischen Themen', false, 100),
  ('citizen-topics', 'Buerger-Themen', 'Erlaubt Nutzern eigene Themen vorzuschlagen', true, 100),
  ('web-push', 'Web Push Notifications', 'Push-Benachrichtigungen ueber den Browser', false, 50)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- Migration: 20260331000030_performance_indexes.sql
-- ============================================

-- Phase 195: Performance indexes for critical query patterns.
-- Only adds indexes not already created in earlier migrations.

-- Vote results lookup by topic
CREATE INDEX IF NOT EXISTS idx_vote_results_topic
  ON vote_results (topic_id);

-- Comment ratings lookup (composite PK exists but this helps filtered queries)
CREATE INDEX IF NOT EXISTS idx_comment_ratings_comment
  ON comment_ratings (comment_id);

-- Reputation events for user (already has unique idempotent index, add user lookup)
-- idx_reputation_idempotent and idx_reputation_user already exist — skip

-- Daily activity for streak calculation
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date
  ON daily_activity (user_id, activity_date DESC);

-- Notifications: partial index for unread only (existing index covers all)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, created_at DESC)
  WHERE is_read = false;

-- Audit log by action (existing idx_audit_log_created covers created_at)
CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON audit_log (action, created_at DESC);

-- Profiles by tier for tier-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_tier
  ON profiles (privilege_tier);

-- Sync runs composite for monitoring dashboard
CREATE INDEX IF NOT EXISTS idx_sync_runs_source_started
  ON sync_runs (source, started_at DESC);

-- User streaks: partial index for expired streak cron job
CREATE INDEX IF NOT EXISTS idx_streaks_expired
  ON user_streaks (last_active_date, streak_shields, current_streak)
  WHERE current_streak > 0;

-- Reports: partial index for moderation queue (pending only)
CREATE INDEX IF NOT EXISTS idx_reports_pending
  ON reports (status, created_at DESC)
  WHERE status = 'pending';

-- Feature flags: partial index for enabled flags
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled
  ON feature_flags (enabled)
  WHERE enabled = true;


-- ============================================
-- Migration: 20260331000031_preload_seed.sql
-- ============================================

-- Phase 197: Pre-load seed -- topics_meta for tracking content generation status
-- Ensures we can track which topics have summaries, quizzes, and news links

CREATE TABLE IF NOT EXISTS topics_meta (
  topic_id UUID PRIMARY KEY REFERENCES topics(id) ON DELETE CASCADE,
  has_summary BOOLEAN DEFAULT false,
  has_quiz BOOLEAN DEFAULT false,
  has_news_links BOOLEAN DEFAULT false,
  preloaded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for finding topics needing content
CREATE INDEX IF NOT EXISTS idx_topics_meta_incomplete
  ON topics_meta (has_summary, has_quiz, has_news_links)
  WHERE has_summary = false OR has_quiz = false OR has_news_links = false;

-- RLS
ALTER TABLE topics_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics_meta_read" ON topics_meta FOR SELECT USING (true);
CREATE POLICY "topics_meta_admin" ON topics_meta FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND privilege_tier >= 4)
);


-- ============================================
-- Seed Data: seed.sql
-- ============================================

-- Seed: 299 Bundestagswahlkreise (Wahlkreiseinteilung 2025)
-- Source: Bundeswahlleiter (https://www.bundeswahlleiter.de)
-- Anlage zu § 2 Absatz 2 BWahlG – Einteilung des Wahlgebietes in Wahlkreise

INSERT INTO wahlkreise (id, name, bundesland) VALUES

-- Schleswig-Holstein (WK 1–11)
(1, 'Flensburg – Schleswig', 'Schleswig-Holstein'),
(2, 'Nordfriesland – Dithmarschen Nord', 'Schleswig-Holstein'),
(3, 'Steinburg – Dithmarschen Süd', 'Schleswig-Holstein'),
(4, 'Rendsburg-Eckernförde', 'Schleswig-Holstein'),
(5, 'Kiel', 'Schleswig-Holstein'),
(6, 'Plön – Neumünster', 'Schleswig-Holstein'),
(7, 'Pinneberg', 'Schleswig-Holstein'),
(8, 'Segeberg – Stormarn-Mitte', 'Schleswig-Holstein'),
(9, 'Ostholstein – Stormarn-Nord', 'Schleswig-Holstein'),
(10, 'Herzogtum Lauenburg – Stormarn-Süd', 'Schleswig-Holstein'),
(11, 'Lübeck', 'Schleswig-Holstein'),

-- Mecklenburg-Vorpommern (WK 12–17)
(12, 'Schwerin – Ludwigslust-Parchim I – Nordwestmecklenburg I', 'Mecklenburg-Vorpommern'),
(13, 'Ludwigslust-Parchim II – Nordwestmecklenburg II – Landkreis Rostock I', 'Mecklenburg-Vorpommern'),
(14, 'Rostock – Landkreis Rostock II', 'Mecklenburg-Vorpommern'),
(15, 'Vorpommern-Rügen – Vorpommern-Greifswald I', 'Mecklenburg-Vorpommern'),
(16, 'Mecklenburgische Seenplatte I – Vorpommern-Greifswald II', 'Mecklenburg-Vorpommern'),
(17, 'Mecklenburgische Seenplatte II – Landkreis Rostock III', 'Mecklenburg-Vorpommern'),

-- Hamburg (WK 18–23)
(18, 'Hamburg-Mitte', 'Hamburg'),
(19, 'Hamburg-Altona', 'Hamburg'),
(20, 'Hamburg-Eimsbüttel', 'Hamburg'),
(21, 'Hamburg-Nord', 'Hamburg'),
(22, 'Hamburg-Wandsbek', 'Hamburg'),
(23, 'Hamburg-Bergedorf – Harburg', 'Hamburg'),

-- Niedersachsen (WK 24–53)
(24, 'Aurich – Emden', 'Niedersachsen'),
(25, 'Unterems', 'Niedersachsen'),
(26, 'Friesland – Wilhelmshaven – Wittmund', 'Niedersachsen'),
(27, 'Oldenburg – Ammerland', 'Niedersachsen'),
(28, 'Delmenhorst – Wesermarsch – Oldenburg-Land', 'Niedersachsen'),
(29, 'Cuxhaven – Stade II', 'Niedersachsen'),
(30, 'Stade I – Rotenburg II', 'Niedersachsen'),
(31, 'Mittelems', 'Niedersachsen'),
(32, 'Cloppenburg – Vechta', 'Niedersachsen'),
(33, 'Diepholz – Nienburg I', 'Niedersachsen'),
(34, 'Osterholz – Verden', 'Niedersachsen'),
(35, 'Rotenburg I – Heidekreis', 'Niedersachsen'),
(36, 'Harburg', 'Niedersachsen'),
(37, 'Lüchow-Dannenberg – Lüneburg', 'Niedersachsen'),
(38, 'Osnabrück-Land', 'Niedersachsen'),
(39, 'Stadt Osnabrück', 'Niedersachsen'),
(40, 'Bad Bentheim – Grafschaft Bentheim', 'Niedersachsen'),
(41, 'Stadt Hannover I', 'Niedersachsen'),
(42, 'Stadt Hannover II', 'Niedersachsen'),
(43, 'Hannover-Land I', 'Niedersachsen'),
(44, 'Hannover-Land II', 'Niedersachsen'),
(45, 'Celle – Uelzen', 'Niedersachsen'),
(46, 'Gifhorn – Peine', 'Niedersachsen'),
(47, 'Hameln-Pyrmont – Holzminden', 'Niedersachsen'),
(48, 'Hildesheim', 'Niedersachsen'),
(49, 'Salzgitter – Wolfenbüttel', 'Niedersachsen'),
(50, 'Braunschweig', 'Niedersachsen'),
(51, 'Helmstedt – Wolfsburg', 'Niedersachsen'),
(52, 'Goslar – Northeim – Osterode', 'Niedersachsen'),
(53, 'Göttingen', 'Niedersachsen'),

-- Bremen (WK 54–55)
(54, 'Bremen I', 'Bremen'),
(55, 'Bremen II – Bremerhaven', 'Bremen'),

-- Brandenburg (WK 56–65)
(56, 'Prignitz – Ostprignitz-Ruppin – Havelland I', 'Brandenburg'),
(57, 'Uckermark – Barnim I', 'Brandenburg'),
(58, 'Oberhavel – Havelland II', 'Brandenburg'),
(59, 'Märkisch-Oderland – Barnim II', 'Brandenburg'),
(60, 'Brandenburg an der Havel – Potsdam-Mittelmark I – Havelland III – Teltow-Fläming I', 'Brandenburg'),
(61, 'Potsdam – Potsdam-Mittelmark II – Teltow-Fläming II', 'Brandenburg'),
(62, 'Dahme-Spreewald – Teltow-Fläming III – Oberspreewald-Lausitz I', 'Brandenburg'),
(63, 'Frankfurt (Oder) – Oder-Spree', 'Brandenburg'),
(64, 'Cottbus – Spree-Neiße', 'Brandenburg'),
(65, 'Elbe-Elster – Oberspreewald-Lausitz II', 'Brandenburg'),

-- Sachsen-Anhalt (WK 66–74)
(66, 'Altmark', 'Sachsen-Anhalt'),
(67, 'Börde – Jerichower Land', 'Sachsen-Anhalt'),
(68, 'Harz', 'Sachsen-Anhalt'),
(69, 'Magdeburg', 'Sachsen-Anhalt'),
(70, 'Dessau – Wittenberg', 'Sachsen-Anhalt'),
(71, 'Anhalt', 'Sachsen-Anhalt'),
(72, 'Mansfeld', 'Sachsen-Anhalt'),
(73, 'Halle (Saale)', 'Sachsen-Anhalt'),
(74, 'Burgenland – Saalekreis', 'Sachsen-Anhalt'),

-- Berlin (WK 75–86)
(75, 'Berlin-Mitte', 'Berlin'),
(76, 'Berlin-Pankow', 'Berlin'),
(77, 'Berlin-Reinickendorf', 'Berlin'),
(78, 'Berlin-Spandau – Charlottenburg Nord', 'Berlin'),
(79, 'Berlin-Steglitz-Zehlendorf', 'Berlin'),
(80, 'Berlin-Charlottenburg-Wilmersdorf', 'Berlin'),
(81, 'Berlin-Tempelhof-Schöneberg', 'Berlin'),
(82, 'Berlin-Neukölln', 'Berlin'),
(83, 'Berlin-Friedrichshain-Kreuzberg – Prenzlauer Berg Ost', 'Berlin'),
(84, 'Berlin-Treptow-Köpenick', 'Berlin'),
(85, 'Berlin-Marzahn-Hellersdorf', 'Berlin'),
(86, 'Berlin-Lichtenberg', 'Berlin'),

-- Nordrhein-Westfalen (WK 87–150)
(87, 'Aachen I', 'Nordrhein-Westfalen'),
(88, 'Aachen II', 'Nordrhein-Westfalen'),
(89, 'Heinsberg', 'Nordrhein-Westfalen'),
(90, 'Düren', 'Nordrhein-Westfalen'),
(91, 'Rhein-Erft-Kreis I', 'Nordrhein-Westfalen'),
(92, 'Euskirchen – Rhein-Erft-Kreis II', 'Nordrhein-Westfalen'),
(93, 'Köln I', 'Nordrhein-Westfalen'),
(94, 'Köln II', 'Nordrhein-Westfalen'),
(95, 'Köln III', 'Nordrhein-Westfalen'),
(96, 'Köln IV', 'Nordrhein-Westfalen'),
(97, 'Bonn', 'Nordrhein-Westfalen'),
(98, 'Rhein-Sieg-Kreis I', 'Nordrhein-Westfalen'),
(99, 'Rhein-Sieg-Kreis II', 'Nordrhein-Westfalen'),
(100, 'Oberbergischer Kreis', 'Nordrhein-Westfalen'),
(101, 'Rheinisch-Bergischer Kreis', 'Nordrhein-Westfalen'),
(102, 'Leverkusen – Köln V', 'Nordrhein-Westfalen'),
(103, 'Wuppertal I', 'Nordrhein-Westfalen'),
(104, 'Wuppertal II – Solingen', 'Nordrhein-Westfalen'),
(105, 'Remscheid', 'Nordrhein-Westfalen'),
(106, 'Mettmann I', 'Nordrhein-Westfalen'),
(107, 'Mettmann II', 'Nordrhein-Westfalen'),
(108, 'Düsseldorf I', 'Nordrhein-Westfalen'),
(109, 'Düsseldorf II', 'Nordrhein-Westfalen'),
(110, 'Neuss I', 'Nordrhein-Westfalen'),
(111, 'Neuss II', 'Nordrhein-Westfalen'),
(112, 'Mönchengladbach', 'Nordrhein-Westfalen'),
(113, 'Krefeld I – Neuss III', 'Nordrhein-Westfalen'),
(114, 'Krefeld II – Wesel II', 'Nordrhein-Westfalen'),
(115, 'Viersen', 'Nordrhein-Westfalen'),
(116, 'Kleve', 'Nordrhein-Westfalen'),
(117, 'Wesel I', 'Nordrhein-Westfalen'),
(118, 'Duisburg I', 'Nordrhein-Westfalen'),
(119, 'Duisburg II', 'Nordrhein-Westfalen'),
(120, 'Oberhausen – Wesel III', 'Nordrhein-Westfalen'),
(121, 'Mülheim – Essen I', 'Nordrhein-Westfalen'),
(122, 'Essen II', 'Nordrhein-Westfalen'),
(123, 'Essen III', 'Nordrhein-Westfalen'),
(124, 'Recklinghausen I', 'Nordrhein-Westfalen'),
(125, 'Recklinghausen II', 'Nordrhein-Westfalen'),
(126, 'Gelsenkirchen', 'Nordrhein-Westfalen'),
(127, 'Bottrop – Recklinghausen III', 'Nordrhein-Westfalen'),
(128, 'Borken I', 'Nordrhein-Westfalen'),
(129, 'Borken II – Coesfeld II', 'Nordrhein-Westfalen'),
(130, 'Coesfeld I – Steinfurt I', 'Nordrhein-Westfalen'),
(131, 'Steinfurt II', 'Nordrhein-Westfalen'),
(132, 'Steinfurt III', 'Nordrhein-Westfalen'),
(133, 'Münster', 'Nordrhein-Westfalen'),
(134, 'Warendorf', 'Nordrhein-Westfalen'),
(135, 'Gütersloh I', 'Nordrhein-Westfalen'),
(136, 'Bielefeld – Gütersloh II', 'Nordrhein-Westfalen'),
(137, 'Herford – Minden-Lübbecke II', 'Nordrhein-Westfalen'),
(138, 'Minden-Lübbecke I', 'Nordrhein-Westfalen'),
(139, 'Lippe I', 'Nordrhein-Westfalen'),
(140, 'Höxter – Lippe II', 'Nordrhein-Westfalen'),
(141, 'Paderborn', 'Nordrhein-Westfalen'),
(142, 'Herne – Bochum II', 'Nordrhein-Westfalen'),
(143, 'Bochum I', 'Nordrhein-Westfalen'),
(144, 'Dortmund I', 'Nordrhein-Westfalen'),
(145, 'Dortmund II', 'Nordrhein-Westfalen'),
(146, 'Unna I', 'Nordrhein-Westfalen'),
(147, 'Hamm – Unna II', 'Nordrhein-Westfalen'),
(148, 'Soest', 'Nordrhein-Westfalen'),
(149, 'Hochsauerlandkreis', 'Nordrhein-Westfalen'),
(150, 'Siegen-Wittgenstein – Olpe', 'Nordrhein-Westfalen'),

-- Sachsen (WK 151–166)
(151, 'Nordsachsen', 'Sachsen'),
(152, 'Leipzig I', 'Sachsen'),
(153, 'Leipzig II', 'Sachsen'),
(154, 'Leipzig III', 'Sachsen'),
(155, 'Leipzig-Land', 'Sachsen'),
(156, 'Meißen', 'Sachsen'),
(157, 'Bautzen I', 'Sachsen'),
(158, 'Görlitz', 'Sachsen'),
(159, 'Sächsische Schweiz-Osterzgebirge', 'Sachsen'),
(160, 'Dresden I', 'Sachsen'),
(161, 'Dresden II – Bautzen II', 'Sachsen'),
(162, 'Mittelsachsen', 'Sachsen'),
(163, 'Chemnitz', 'Sachsen'),
(164, 'Chemnitzer Umland – Erzgebirgskreis II', 'Sachsen'),
(165, 'Erzgebirgskreis I', 'Sachsen'),
(166, 'Zwickau', 'Sachsen'),

-- Thüringen (WK 167–174)
(167, 'Eichsfeld – Nordhausen – Kyffhäuserkreis', 'Thüringen'),
(168, 'Eisenach – Wartburgkreis – Unstrut-Hainich-Kreis', 'Thüringen'),
(169, 'Jena – Sömmerda – Weimarer Land I', 'Thüringen'),
(170, 'Gotha – Ilm-Kreis', 'Thüringen'),
(171, 'Erfurt – Weimar – Weimarer Land II', 'Thüringen'),
(172, 'Gera – Greiz – Altenburger Land', 'Thüringen'),
(173, 'Saalfeld-Rudolstadt – Saale-Holzland-Kreis – Saale-Orla-Kreis', 'Thüringen'),
(174, 'Suhl – Schmalkalden-Meiningen – Hildburghausen – Sonneberg', 'Thüringen'),

-- Hessen (WK 175–196)
(175, 'Waldeck', 'Hessen'),
(176, 'Kassel', 'Hessen'),
(177, 'Werra-Meißner – Hersfeld-Rotenburg', 'Hessen'),
(178, 'Schwalm-Eder', 'Hessen'),
(179, 'Marburg', 'Hessen'),
(180, 'Lahn-Dill', 'Hessen'),
(181, 'Gießen', 'Hessen'),
(182, 'Fulda', 'Hessen'),
(183, 'Main-Kinzig – Wetterau II – Schotten', 'Hessen'),
(184, 'Hochtaunus', 'Hessen'),
(185, 'Wetterau I', 'Hessen'),
(186, 'Rheingau-Taunus – Limburg', 'Hessen'),
(187, 'Wiesbaden', 'Hessen'),
(188, 'Hanau', 'Hessen'),
(189, 'Main-Taunus', 'Hessen'),
(190, 'Frankfurt am Main I', 'Hessen'),
(191, 'Frankfurt am Main II', 'Hessen'),
(192, 'Groß-Gerau', 'Hessen'),
(193, 'Offenbach', 'Hessen'),
(194, 'Darmstadt', 'Hessen'),
(195, 'Odenwald', 'Hessen'),
(196, 'Bergstraße', 'Hessen'),

-- Rheinland-Pfalz (WK 197–211)
(197, 'Neuwied', 'Rheinland-Pfalz'),
(198, 'Ahrweiler', 'Rheinland-Pfalz'),
(199, 'Koblenz', 'Rheinland-Pfalz'),
(200, 'Mosel/Rhein-Hunsrück', 'Rheinland-Pfalz'),
(201, 'Bitburg', 'Rheinland-Pfalz'),
(202, 'Trier', 'Rheinland-Pfalz'),
(203, 'Montabaur', 'Rheinland-Pfalz'),
(204, 'Mainz', 'Rheinland-Pfalz'),
(205, 'Worms', 'Rheinland-Pfalz'),
(206, 'Alzey – Worms', 'Rheinland-Pfalz'),
(207, 'Bad Kreuznach', 'Rheinland-Pfalz'),
(208, 'Kaiserslautern', 'Rheinland-Pfalz'),
(209, 'Pirmasens', 'Rheinland-Pfalz'),
(210, 'Neustadt – Speyer', 'Rheinland-Pfalz'),
(211, 'Ludwigshafen/Frankenthal', 'Rheinland-Pfalz'),

-- Bayern (WK 212–257)
(212, 'Altötting', 'Bayern'),
(213, 'Erding – Ebersberg', 'Bayern'),
(214, 'Freising', 'Bayern'),
(215, 'Fürstenfeldbruck', 'Bayern'),
(216, 'Ingolstadt', 'Bayern'),
(217, 'München-Nord', 'Bayern'),
(218, 'München-Ost', 'Bayern'),
(219, 'München-Süd', 'Bayern'),
(220, 'München-West/Mitte', 'Bayern'),
(221, 'München-Land', 'Bayern'),
(222, 'Rosenheim', 'Bayern'),
(223, 'Bad Tölz-Wolfratshausen – Miesbach', 'Bayern'),
(224, 'Starnberg – Landsberg am Lech', 'Bayern'),
(225, 'Traunstein', 'Bayern'),
(226, 'Weilheim', 'Bayern'),
(227, 'Deggendorf', 'Bayern'),
(228, 'Landshut', 'Bayern'),
(229, 'Passau', 'Bayern'),
(230, 'Rottal-Inn', 'Bayern'),
(231, 'Straubing', 'Bayern'),
(232, 'Amberg', 'Bayern'),
(233, 'Regensburg', 'Bayern'),
(234, 'Schwandorf', 'Bayern'),
(235, 'Weiden', 'Bayern'),
(236, 'Bamberg', 'Bayern'),
(237, 'Bayreuth', 'Bayern'),
(238, 'Coburg', 'Bayern'),
(239, 'Hof', 'Bayern'),
(240, 'Kulmbach', 'Bayern'),
(241, 'Ansbach', 'Bayern'),
(242, 'Erlangen', 'Bayern'),
(243, 'Fürth', 'Bayern'),
(244, 'Nürnberg-Nord', 'Bayern'),
(245, 'Nürnberg-Süd', 'Bayern'),
(246, 'Roth', 'Bayern'),
(247, 'Aschaffenburg', 'Bayern'),
(248, 'Bad Kissingen', 'Bayern'),
(249, 'Main-Spessart', 'Bayern'),
(250, 'Schweinfurt', 'Bayern'),
(251, 'Würzburg', 'Bayern'),
(252, 'Augsburg-Stadt', 'Bayern'),
(253, 'Augsburg-Land', 'Bayern'),
(254, 'Donau-Ries', 'Bayern'),
(255, 'Neu-Ulm', 'Bayern'),
(256, 'Oberallgäu', 'Bayern'),
(257, 'Ostallgäu', 'Bayern'),

-- Saarland (WK 258–261)
(258, 'Saarbrücken', 'Saarland'),
(259, 'Saarlouis', 'Saarland'),
(260, 'St. Wendel', 'Saarland'),
(261, 'Homburg', 'Saarland'),

-- Baden-Württemberg (WK 262–299)
(262, 'Stuttgart I', 'Baden-Württemberg'),
(263, 'Stuttgart II', 'Baden-Württemberg'),
(264, 'Böblingen', 'Baden-Württemberg'),
(265, 'Esslingen', 'Baden-Württemberg'),
(266, 'Nürtingen', 'Baden-Württemberg'),
(267, 'Göppingen', 'Baden-Württemberg'),
(268, 'Ludwigsburg', 'Baden-Württemberg'),
(269, 'Waiblingen', 'Baden-Württemberg'),
(270, 'Backnang – Schwäbisch Gmünd', 'Baden-Württemberg'),
(271, 'Heilbronn', 'Baden-Württemberg'),
(272, 'Schwäbisch Hall – Hohenlohe', 'Baden-Württemberg'),
(273, 'Neckar-Zaber', 'Baden-Württemberg'),
(274, 'Pforzheim', 'Baden-Württemberg'),
(275, 'Calw', 'Baden-Württemberg'),
(276, 'Karlsruhe-Stadt', 'Baden-Württemberg'),
(277, 'Karlsruhe-Land', 'Baden-Württemberg'),
(278, 'Rastatt', 'Baden-Württemberg'),
(279, 'Heidelberg', 'Baden-Württemberg'),
(280, 'Mannheim', 'Baden-Württemberg'),
(281, 'Odenwald – Tauber', 'Baden-Württemberg'),
(282, 'Rhein-Neckar', 'Baden-Württemberg'),
(283, 'Bruchsal – Schwetzingen', 'Baden-Württemberg'),
(284, 'Offenburg', 'Baden-Württemberg'),
(285, 'Freiburg', 'Baden-Württemberg'),
(286, 'Lörrach – Müllheim', 'Baden-Württemberg'),
(287, 'Emmendingen – Lahr', 'Baden-Württemberg'),
(288, 'Rottweil – Tuttlingen', 'Baden-Württemberg'),
(289, 'Schwarzwald-Baar', 'Baden-Württemberg'),
(290, 'Konstanz', 'Baden-Württemberg'),
(291, 'Waldshut', 'Baden-Württemberg'),
(292, 'Reutlingen', 'Baden-Württemberg'),
(293, 'Tübingen', 'Baden-Württemberg'),
(294, 'Ulm', 'Baden-Württemberg'),
(295, 'Biberach', 'Baden-Württemberg'),
(296, 'Bodensee', 'Baden-Württemberg'),
(297, 'Ravensburg', 'Baden-Württemberg'),
(298, 'Zollernalb – Sigmaringen', 'Baden-Württemberg'),
(299, 'Balingen – Hechingen', 'Baden-Württemberg')
;

-- Total: 299 Wahlkreise
-- Note: geometry column will be populated later via GeoJSON import
