-- Phase 031: Comment Ratings

CREATE TABLE comment_ratings (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating IN (-1, 0, 1)),
  voter_position TEXT CHECK (voter_position IN ('pro', 'contra', 'neutral')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

ALTER TABLE comment_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY ratings_select ON comment_ratings FOR SELECT
  USING (true);

CREATE POLICY ratings_insert ON comment_ratings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ratings_update ON comment_ratings FOR UPDATE
  USING (user_id = auth.uid());

-- Trigger: update upvotes/downvotes counters on comments
CREATE OR REPLACE FUNCTION update_comment_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.rating = 1 THEN
      UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.rating = -1 THEN
      UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Decrement old
    IF OLD.rating = 1 THEN
      UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
    ELSIF OLD.rating = -1 THEN
      UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
    END IF;
    -- Increment new
    IF NEW.rating = 1 THEN
      UPDATE comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.rating = -1 THEN
      UPDATE comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.rating = 1 THEN
      UPDATE comments SET upvotes = upvotes - 1 WHERE id = OLD.comment_id;
    ELSIF OLD.rating = -1 THEN
      UPDATE comments SET downvotes = downvotes - 1 WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_comment_vote_counts
AFTER INSERT OR UPDATE OR DELETE ON comment_ratings
FOR EACH ROW EXECUTE FUNCTION update_comment_vote_counts();
