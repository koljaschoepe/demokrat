-- Phase 056: Sitzungswochen (Parliamentary Session Weeks)

CREATE TABLE sitzungswochen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  label TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_sitzungswochen_dates ON sitzungswochen (start_date, end_date);
CREATE INDEX idx_sitzungswochen_active ON sitzungswochen (is_active) WHERE is_active = true;
