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
