-- Phase 035: Reports + RLS

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('comment', 'topic', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'confirmed', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports (status);
CREATE INDEX idx_reports_target ON reports (target_type, target_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Own reports readable
CREATE POLICY reports_select_own ON reports FOR SELECT
  USING (reporter_id = auth.uid());

-- Moderators (privilege_tier >= 3) can read all
CREATE POLICY reports_select_moderator ON reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND privilege_tier >= 3
  ));

CREATE POLICY reports_insert ON reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- Moderators can update status
CREATE POLICY reports_update_moderator ON reports FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND privilege_tier >= 3
  ));
