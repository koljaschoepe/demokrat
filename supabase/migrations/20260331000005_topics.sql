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
