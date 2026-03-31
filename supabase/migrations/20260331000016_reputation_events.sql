-- Phase 032: Reputation Events

CREATE TABLE reputation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotency: prevent duplicate point awards for same action on same reference
CREATE UNIQUE INDEX idx_reputation_idempotent
  ON reputation_events (user_id, action, reference_type, reference_id)
  WHERE reference_id IS NOT NULL;

CREATE INDEX idx_reputation_user ON reputation_events (user_id, created_at DESC);

ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY reputation_select ON reputation_events FOR SELECT
  USING (user_id = auth.uid());
