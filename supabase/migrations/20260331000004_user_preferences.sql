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
