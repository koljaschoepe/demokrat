-- Phase 023: Topic News Links

CREATE TABLE topic_news_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_icon TEXT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_links_topic ON topic_news_links (topic_id);

ALTER TABLE topic_news_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY news_links_select ON topic_news_links FOR SELECT
  USING (true);
