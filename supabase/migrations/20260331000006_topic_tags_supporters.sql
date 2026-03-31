-- Phase 022: Topic Tags & Supporters

CREATE TABLE topic_tags (
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (topic_id, tag)
);

CREATE INDEX idx_topic_tags_tag ON topic_tags (tag);

CREATE TABLE topic_supporters (
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (topic_id, user_id)
);

ALTER TABLE topic_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_supporters ENABLE ROW LEVEL SECURITY;

-- Tags: readable by all authenticated users
CREATE POLICY topic_tags_select ON topic_tags FOR SELECT
  USING (true);

CREATE POLICY topic_tags_insert ON topic_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM topics WHERE id = topic_id AND created_by = auth.uid()
  ));

CREATE POLICY topic_tags_delete ON topic_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM topics WHERE id = topic_id AND created_by = auth.uid()
  ));

-- Supporters: publicly readable, own insertable/deletable
CREATE POLICY supporters_select ON topic_supporters FOR SELECT
  USING (true);

CREATE POLICY supporters_insert ON topic_supporters FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY supporters_delete ON topic_supporters FOR DELETE
  USING (user_id = auth.uid());

-- Trigger: update supporter_count on topics
CREATE OR REPLACE FUNCTION update_supporter_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topics SET supporter_count = supporter_count + 1
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topics SET supporter_count = supporter_count - 1
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_supporter_count
AFTER INSERT OR DELETE ON topic_supporters
FOR EACH ROW EXECUTE FUNCTION update_supporter_count();
