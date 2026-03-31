-- Phase 197: Pre-load seed -- topics_meta for tracking content generation status
-- Ensures we can track which topics have summaries, quizzes, and news links

CREATE TABLE IF NOT EXISTS topics_meta (
  topic_id UUID PRIMARY KEY REFERENCES topics(id) ON DELETE CASCADE,
  has_summary BOOLEAN DEFAULT false,
  has_quiz BOOLEAN DEFAULT false,
  has_news_links BOOLEAN DEFAULT false,
  preloaded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for finding topics needing content
CREATE INDEX IF NOT EXISTS idx_topics_meta_incomplete
  ON topics_meta (has_summary, has_quiz, has_news_links)
  WHERE has_summary = false OR has_quiz = false OR has_news_links = false;

-- RLS
ALTER TABLE topics_meta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "topics_meta_read" ON topics_meta FOR SELECT USING (true);
CREATE POLICY "topics_meta_admin" ON topics_meta FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND privilege_tier >= 4)
);
