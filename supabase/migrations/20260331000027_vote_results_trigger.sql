-- Phase 069 — Vote Results Projection Trigger (improved version)
--
-- Replaces the basic trigger from migration 000025 with a more robust version.
-- Handles VoteCast, VoteChanged, VoteRevoked with safe JSONB manipulation.

-- Drop existing trigger if present (from migration 000025)
DROP TRIGGER IF EXISTS trg_vote_results ON vote_events;

CREATE OR REPLACE FUNCTION update_vote_results()
RETURNS TRIGGER AS $$
DECLARE
  v_choice TEXT;
  v_old_choice TEXT;
  v_new_choice TEXT;
BEGIN
  -- Ensure a vote_results row exists for this topic
  INSERT INTO vote_results (topic_id, total_votes, results)
  VALUES (NEW.stream_id, 0, '{}'::jsonb)
  ON CONFLICT (topic_id) DO NOTHING;

  IF NEW.event_type = 'VoteCast' THEN
    -- Extract choice from payload
    v_choice := NEW.payload->>'choice';

    IF v_choice IS NULL THEN
      RAISE WARNING 'VoteCast event missing choice in payload, event_id: %', NEW.event_id;
      RETURN NEW;
    END IF;

    -- Increment total_votes and the specific choice count
    UPDATE vote_results
    SET
      total_votes = total_votes + 1,
      results = jsonb_set(
        results,
        ARRAY[v_choice],
        to_jsonb(COALESCE((results->>v_choice)::int, 0) + 1)
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

    -- Keep topics.vote_count in sync
    UPDATE topics SET vote_count = vote_count + 1
    WHERE id = NEW.stream_id;

  ELSIF NEW.event_type = 'VoteChanged' THEN
    -- Extract old and new choices from payload
    v_old_choice := NEW.payload->>'old_choice';
    v_new_choice := NEW.payload->>'new_choice';

    IF v_old_choice IS NULL OR v_new_choice IS NULL THEN
      RAISE WARNING 'VoteChanged event missing old_choice or new_choice, event_id: %', NEW.event_id;
      RETURN NEW;
    END IF;

    -- Decrement old choice, increment new choice; total_votes unchanged
    UPDATE vote_results
    SET
      results = jsonb_set(
        jsonb_set(
          results,
          ARRAY[v_old_choice],
          to_jsonb(GREATEST(COALESCE((results->>v_old_choice)::int, 0) - 1, 0))
        ),
        ARRAY[v_new_choice],
        -- Must re-read from the intermediate result for new_choice
        -- Since jsonb_set returns a new JSONB, if new_choice == old_choice this is a no-op
        to_jsonb(
          CASE
            WHEN v_new_choice = v_old_choice THEN COALESCE((results->>v_new_choice)::int, 0)
            ELSE COALESCE((results->>v_new_choice)::int, 0) + 1
          END
        )
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

    -- topics.vote_count stays unchanged for VoteChanged

  ELSIF NEW.event_type = 'VoteRevoked' THEN
    -- Extract the revoked choice from payload
    v_choice := NEW.payload->>'choice';

    IF v_choice IS NULL THEN
      RAISE WARNING 'VoteRevoked event missing choice in payload, event_id: %', NEW.event_id;
      RETURN NEW;
    END IF;

    -- Decrement total_votes and the specific choice count
    UPDATE vote_results
    SET
      total_votes = GREATEST(total_votes - 1, 0),
      results = jsonb_set(
        results,
        ARRAY[v_choice],
        to_jsonb(GREATEST(COALESCE((results->>v_choice)::int, 0) - 1, 0))
      ),
      last_updated = now()
    WHERE topic_id = NEW.stream_id;

    -- Keep topics.vote_count in sync
    UPDATE topics SET vote_count = GREATEST(vote_count - 1, 0)
    WHERE id = NEW.stream_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER trg_vote_results
AFTER INSERT ON vote_events
FOR EACH ROW EXECUTE FUNCTION update_vote_results();
