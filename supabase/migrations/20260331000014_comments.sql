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
