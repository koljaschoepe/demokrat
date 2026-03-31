-- Phase 028: Vote Events (Append-Only Event Store)

CREATE TABLE vote_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES topics(id),
  event_type TEXT NOT NULL
    CHECK (event_type IN ('VoteCast', 'VoteChanged', 'VoteRevoked', 'DelegationSet', 'DelegationRevoked')),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  payload JSONB NOT NULL,
  prev_hash TEXT,
  event_hash TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sequence_number BIGINT GENERATED ALWAYS AS IDENTITY
);

-- Stream replay index
CREATE INDEX idx_vote_events_stream ON vote_events (stream_id, sequence_number);

-- Prevent double voting: only one active VoteCast per user per topic
CREATE UNIQUE INDEX idx_vote_events_user_topic ON vote_events (user_id, stream_id)
  WHERE event_type = 'VoteCast';

-- User vote history
CREATE INDEX idx_vote_events_user ON vote_events (user_id, created_at DESC);

-- Append-only rules: prevent updates and deletes
CREATE RULE vote_events_no_update AS ON UPDATE TO vote_events DO INSTEAD NOTHING;
CREATE RULE vote_events_no_delete AS ON DELETE TO vote_events DO INSTEAD NOTHING;

ALTER TABLE vote_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own votes
CREATE POLICY vote_events_insert ON vote_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can read their own votes
CREATE POLICY vote_events_select ON vote_events FOR SELECT
  USING (user_id = auth.uid());
