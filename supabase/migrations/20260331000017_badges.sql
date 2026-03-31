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
