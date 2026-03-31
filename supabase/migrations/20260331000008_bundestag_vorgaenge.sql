-- Phase 024: Bundestag Vorgaenge (Parliamentary Proceedings)

CREATE TABLE bundestag_vorgaenge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dip_id TEXT UNIQUE NOT NULL,
  titel TEXT,
  abstract TEXT,
  sachgebiet TEXT[],
  vorgangstyp TEXT,
  beratungsstand TEXT,
  initiative TEXT[],
  datum DATE,
  aktualisiert TIMESTAMPTZ,
  deskriptor TEXT[],
  raw_data JSONB,
  topic_id UUID REFERENCES topics(id),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vorgaenge_dip ON bundestag_vorgaenge (dip_id);
CREATE INDEX idx_vorgaenge_topic ON bundestag_vorgaenge (topic_id);
