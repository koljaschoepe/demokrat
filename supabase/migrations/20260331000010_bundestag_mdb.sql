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
