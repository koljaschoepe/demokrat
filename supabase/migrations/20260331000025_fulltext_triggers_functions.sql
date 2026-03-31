-- Phase 041: Full-text Search, Triggers & DB Functions

-- =============================================================
-- 1. German full-text search index on topics
-- =============================================================
CREATE INDEX idx_topics_search ON topics
  USING GIN (to_tsvector('german', coalesce(title, '') || ' ' || coalesce(description, '')));

-- =============================================================
-- 2. Vote Results Projection Trigger
-- =============================================================
CREATE OR REPLACE FUNCTION update_vote_results()
RETURNS TRIGGER AS $$
DECLARE
  current_results JSONB;
  choice TEXT;
  old_choice TEXT;
BEGIN
  -- Get the choice from payload
  choice := NEW.payload->>'choice';

  -- Ensure vote_results row exists
  INSERT INTO vote_results (topic_id, total_votes, results)
  VALUES (NEW.stream_id, 0, '{}')
  ON CONFLICT (topic_id) DO NOTHING;

  IF NEW.event_type = 'VoteCast' THEN
    UPDATE vote_results
    SET
      total_votes = total_votes + 1,
      results = jsonb_set(
        results,
        ARRAY[choice],
        to_jsonb(COALESCE((results->>choice)::int, 0) + 1)
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

    -- Update topic vote_count
    UPDATE topics SET vote_count = vote_count + 1
    WHERE id = NEW.stream_id;

  ELSIF NEW.event_type = 'VoteChanged' THEN
    old_choice := NEW.payload->>'old_choice';
    UPDATE vote_results
    SET
      results = jsonb_set(
        jsonb_set(
          results,
          ARRAY[old_choice],
          to_jsonb(GREATEST(COALESCE((results->>old_choice)::int, 0) - 1, 0))
        ),
        ARRAY[choice],
        to_jsonb(COALESCE((results->>choice)::int, 0) + 1)
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

  ELSIF NEW.event_type = 'VoteRevoked' THEN
    old_choice := NEW.payload->>'old_choice';
    UPDATE vote_results
    SET
      total_votes = GREATEST(total_votes - 1, 0),
      results = jsonb_set(
        results,
        ARRAY[COALESCE(old_choice, choice)],
        to_jsonb(GREATEST(COALESCE((results->>COALESCE(old_choice, choice))::int, 0) - 1, 0))
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

    -- Update topic vote_count
    UPDATE topics SET vote_count = GREATEST(vote_count - 1, 0)
    WHERE id = NEW.stream_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_vote_results
AFTER INSERT ON vote_events
FOR EACH ROW EXECUTE FUNCTION update_vote_results();

-- =============================================================
-- 3. Auto-Activate Topic when supporter_count >= threshold
-- =============================================================
CREATE OR REPLACE FUNCTION auto_activate_topic()
RETURNS TRIGGER AS $$
DECLARE
  threshold INTEGER := 10; -- Configurable threshold
BEGIN
  IF NEW.supporter_count >= threshold AND NEW.status = 'pending' THEN
    NEW.status := 'active';
    NEW.voting_opens_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auto_activate_topic
BEFORE UPDATE OF supporter_count ON topics
FOR EACH ROW EXECUTE FUNCTION auto_activate_topic();

-- =============================================================
-- 4. Generic updated_at trigger function
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_wahlkreis_stats_updated_at
  BEFORE UPDATE ON wahlkreis_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- 5. Comment flagging on report confirmation
-- =============================================================
CREATE OR REPLACE FUNCTION flag_reported_comment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND NEW.target_type = 'comment' THEN
    UPDATE comments SET is_flagged = true WHERE id = NEW.target_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_flag_reported_comment
AFTER UPDATE OF status ON reports
FOR EACH ROW
WHEN (NEW.status = 'confirmed')
EXECUTE FUNCTION flag_reported_comment();

-- =============================================================
-- 6. Enable Supabase Realtime for vote_results
-- =============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE vote_results;

-- =============================================================
-- 7. Update comment_count on topics when comments change
-- =============================================================
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topics SET comment_count = comment_count + 1
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topics SET comment_count = comment_count - 1
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();
