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
