-- Phase 040: Platform Metrics & Wahlkreis Stats

CREATE TABLE platform_metrics (
  metric_date DATE PRIMARY KEY,
  active_users_today INTEGER NOT NULL DEFAULT 0,
  votes_today INTEGER NOT NULL DEFAULT 0,
  avg_bridging_score FLOAT NOT NULL DEFAULT 0,
  active_wahlkreise INTEGER NOT NULL DEFAULT 0,
  diversity_index FLOAT NOT NULL DEFAULT 0,
  mdb_emails_sent INTEGER NOT NULL DEFAULT 0,
  puls_score FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wahlkreis_stats (
  wahlkreis_id INTEGER PRIMARY KEY REFERENCES wahlkreise(id),
  registered_users INTEGER NOT NULL DEFAULT 0,
  active_users_week INTEGER NOT NULL DEFAULT 0,
  votes_week INTEGER NOT NULL DEFAULT 0,
  avg_bridging_score FLOAT NOT NULL DEFAULT 0,
  category_diversity INTEGER NOT NULL DEFAULT 0,
  mdb_emails_sent INTEGER NOT NULL DEFAULT 0,
  fortschritt_stufe INTEGER NOT NULL DEFAULT 1 CHECK (fortschritt_stufe BETWEEN 1 AND 5),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wahlkreis_stats ENABLE ROW LEVEL SECURITY;

-- Publicly readable
CREATE POLICY platform_metrics_select ON platform_metrics FOR SELECT
  USING (true);

CREATE POLICY wahlkreis_stats_select ON wahlkreis_stats FOR SELECT
  USING (true);
