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
