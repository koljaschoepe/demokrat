-- Phase 195: Performance indexes for critical query patterns.
-- Only adds indexes not already created in earlier migrations.

-- Vote results lookup by topic
CREATE INDEX IF NOT EXISTS idx_vote_results_topic
  ON vote_results (topic_id);

-- Comment ratings lookup (composite PK exists but this helps filtered queries)
CREATE INDEX IF NOT EXISTS idx_comment_ratings_comment
  ON comment_ratings (comment_id);

-- Reputation events for user (already has unique idempotent index, add user lookup)
-- idx_reputation_idempotent and idx_reputation_user already exist — skip

-- Daily activity for streak calculation
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date
  ON daily_activity (user_id, activity_date DESC);

-- Notifications: partial index for unread only (existing index covers all)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, created_at DESC)
  WHERE is_read = false;

-- Audit log by action (existing idx_audit_log_created covers created_at)
CREATE INDEX IF NOT EXISTS idx_audit_log_action
  ON audit_log (action, created_at DESC);

-- Profiles by tier for tier-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_tier
  ON profiles (privilege_tier);

-- Sync runs composite for monitoring dashboard
CREATE INDEX IF NOT EXISTS idx_sync_runs_source_started
  ON sync_runs (source, started_at DESC);

-- User streaks: partial index for expired streak cron job
CREATE INDEX IF NOT EXISTS idx_streaks_expired
  ON user_streaks (last_active_date, streak_shields, current_streak)
  WHERE current_streak > 0;

-- Reports: partial index for moderation queue (pending only)
CREATE INDEX IF NOT EXISTS idx_reports_pending
  ON reports (status, created_at DESC)
  WHERE status = 'pending';

-- Feature flags: partial index for enabled flags
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled
  ON feature_flags (enabled)
  WHERE enabled = true;
