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
