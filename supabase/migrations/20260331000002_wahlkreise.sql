-- Phase 018: Wahlkreise (Electoral Districts)

CREATE TABLE wahlkreise (
  id INTEGER PRIMARY KEY, -- Official WK-Number 1-299
  name TEXT NOT NULL,
  bundesland TEXT NOT NULL,
  geometry JSONB -- GeoJSON for map display
);

-- Index for Bundesland filtering
CREATE INDEX idx_wahlkreise_bundesland ON wahlkreise (bundesland);
