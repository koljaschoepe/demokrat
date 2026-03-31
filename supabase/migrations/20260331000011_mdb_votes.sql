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
