/**
 * Phase 149 — Notification Preferences
 *
 * Prueft ob ein Nutzer eine bestimmte Benachrichtigungsart
 * erhalten moechte, basierend auf seinen Praeferenzen.
 */

import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ─── Notification Type ──────────────────────────────────────────────

export type NotificationType =
  | 'new_vote'
  | 'vote_result'
  | 'bundestag_result'
  | 'comment_reply'
  | 'bridging_achievement'
  | 'streak_milestone'
  | 'quest_complete'
  | 'wahlkreis_update'
  | 'mdb_voted'
  | 'topic_activated'
  | 'system'
  | 'topic_closing'
  | 'badge_earned'
  | 'streak_reminder'
  | 'new_topic'
  | 'supporter_milestone'
  | 'privilege_upgrade'
  | 'sitzungswoche'
  | 'quest_complete';

// ─── Preference Column Mapping ──────────────────────────────────────

/**
 * Maps notification types to user_preferences table columns.
 * Types mapped to `null` always generate a notification regardless
 * of user settings (streak_milestone, quest_complete, topic_activated, system).
 */
const TYPE_TO_PREFERENCE_COLUMN: Record<string, string | null> = {
  // votes group → notification_votes
  new_vote: 'notification_votes',
  vote_result: 'notification_votes',
  bundestag_result: 'notification_votes',
  new_topic: 'notification_votes',
  topic_closing: 'notification_votes',

  // comments group → notification_comments
  comment_reply: 'notification_comments',
  bridging_achievement: 'notification_comments',

  // results group → notification_results
  mdb_voted: 'notification_results',
  wahlkreis_update: 'notification_results',
  sitzungswoche: 'notification_results',

  // always notify (no preference check)
  streak_milestone: null,
  streak_reminder: null,
  quest_complete: null,
  topic_activated: null,
  system: null,
  badge_earned: null,
  supporter_milestone: null,
  privilege_upgrade: null,
};

// ─── Public API ─────────────────────────────────────────────────────

/**
 * Checks whether a user should receive a specific notification type.
 *
 * Returns `true` if the notification should be created. Returns `true`
 * by default when no preference row exists or the type always notifies.
 */
export async function shouldNotify(
  userId: string,
  notificationType: string,
): Promise<boolean> {
  const column = TYPE_TO_PREFERENCE_COLUMN[notificationType];

  // Types without a preference column always notify
  if (column === null || column === undefined) {
    return true;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('user_preferences')
      .select(column)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // No preferences row — default to notify
      return true;
    }

    const row = data as AnyRow;
    // Only skip if explicitly set to false
    return row[column] !== false;
  } catch {
    // On any error, default to notify
    return true;
  }
}
