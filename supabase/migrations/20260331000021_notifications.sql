-- Phase 037: Notifications + Index

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'new_vote',
    'vote_result',
    'bundestag_result',
    'comment_reply',
    'bridging_achievement',
    'streak_milestone',
    'quest_complete',
    'wahlkreis_update',
    'mdb_voted',
    'topic_activated',
    'system'
  )),
  title TEXT NOT NULL,
  body TEXT,
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary query: unread notifications for user, newest first
CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY notifications_update ON notifications FOR UPDATE
  USING (user_id = auth.uid());
