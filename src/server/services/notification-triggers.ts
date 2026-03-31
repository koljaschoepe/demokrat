/**
 * Phase 140 & 149 — Notification Triggers
 *
 * Comprehensive trigger registry for all notification types.
 * Handles: comment replies, bridging achievements, topic activation,
 * vote milestones, vote/bundestag results, streaks, quests,
 * wahlkreis updates, MdB votes, topic closing, privilege upgrades,
 * supporter milestones, and system announcements.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import {
  createNotification,
  createBulkNotifications,
} from '@/server/services/notification.service';
import type { CreateNotificationParams } from '@/server/services/notification.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Splits an array into chunks of a given size.
 */
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// ─── 1. notifyNewVote ───────────────────────────────────────────────

/**
 * Notifies the topic creator when vote milestones are reached
 * (10, 50, 100, 500, 1000 votes).
 */
export async function notifyNewVote(
  topicId: string,
  voterCount: number,
): Promise<void> {
  try {
    const milestones = [10, 50, 100, 500, 1000];
    if (!milestones.includes(voterCount)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Get topic creator
    const { data: topic, error } = await supabase
      .from('topics')
      .select('created_by, title')
      .eq('id', topicId)
      .single();

    if (error || !topic) return;

    const creatorId = (topic as AnyRow).created_by as string;
    const title = (topic as AnyRow).title as string;

    await createNotification({
      userId: creatorId,
      type: 'new_vote',
      title: 'Abstimmungs-Meilenstein',
      description: `"${title}" hat ${voterCount} Stimmen erreicht!`,
      payload: { topic_id: topicId, voter_count: voterCount },
      href: `/themen/${topicId}`,
    });
  } catch (err) {
    console.error('[notification-triggers] notifyNewVote fehlgeschlagen:', err);
  }
}

// ─── 2. notifyVoteResult ────────────────────────────────────────────

/**
 * Notifies all voters of a topic when voting closes.
 */
export async function notifyVoteResult(
  topicId: string,
  title: string,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('vote_events')
      .select('user_id')
      .eq('topic_id', topicId);

    if (error || !data) return;

    // Deduplicate user IDs (user may have multiple vote events)
    const uniqueUserIds = [...new Set((data as AnyRow[]).map((r: AnyRow) => r.user_id as string))];
    const batches = chunk(uniqueUserIds, 100);

    for (const batch of batches) {
      const notifications: CreateNotificationParams[] = batch.map((userId) => ({
        userId,
        type: 'vote_result' as const,
        title: 'Abstimmungsergebnis',
        description: `Das Ergebnis für "${title}" liegt vor.`,
        payload: { topic_id: topicId, topic_title: title },
        href: `/themen/${topicId}/ergebnis`,
      }));
      await createBulkNotifications(notifications);
    }
  } catch (err) {
    console.error('[notification-triggers] notifyVoteResult fehlgeschlagen:', err);
  }
}

// ─── 3. notifyBundestagResult ───────────────────────────────────────

/**
 * Notifies voters when Bundestag result comes in for a topic.
 */
export async function notifyBundestagResult(
  topicId: string,
  title: string,
  bundestagResult: string,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('vote_events')
      .select('user_id')
      .eq('topic_id', topicId);

    if (error || !data) return;

    const uniqueUserIds = [...new Set((data as AnyRow[]).map((r: AnyRow) => r.user_id as string))];
    const batches = chunk(uniqueUserIds, 100);

    for (const batch of batches) {
      const notifications: CreateNotificationParams[] = batch.map((userId) => ({
        userId,
        type: 'bundestag_result' as const,
        title: 'Bundestag-Ergebnis',
        description: `Der Bundestag hat über "${title}" abgestimmt: ${bundestagResult}.`,
        payload: {
          topic_id: topicId,
          topic_title: title,
          bundestag_result: bundestagResult,
        },
        href: `/themen/${topicId}/ergebnis`,
      }));
      await createBulkNotifications(notifications);
    }
  } catch (err) {
    console.error('[notification-triggers] notifyBundestagResult fehlgeschlagen:', err);
  }
}

// ─── 4. notifyCommentReply ──────────────────────────────────────────

/**
 * Notifies the author of a comment when someone replies.
 * Does not create a notification if the reply author is the same
 * as the parent comment author.
 */
export async function notifyCommentReply(
  commentId: string,
  replyAuthorId: string,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Load parent comment
    const { data: parent, error } = await supabase
      .from('comments')
      .select('user_id, topic_id')
      .eq('id', commentId)
      .single();

    if (error || !parent) return;

    const parentAuthor = (parent as AnyRow).user_id as string;
    const topicId = (parent as AnyRow).topic_id as string;

    // No self-notification
    if (parentAuthor === replyAuthorId) return;

    await createNotification({
      userId: parentAuthor,
      type: 'comment_reply',
      title: 'Neue Antwort',
      description: 'Jemand hat auf deinen Kommentar geantwortet.',
      payload: {
        comment_id: commentId,
        reply_author_id: replyAuthorId,
        topic_id: topicId,
      },
      href: `/themen/${topicId}#comment-${commentId}`,
    });
  } catch (err) {
    console.error('[notification-triggers] notifyCommentReply fehlgeschlagen:', err);
  }
}

// ─── 5. notifyBridgingAchievement ───────────────────────────────────

/**
 * Notifies a user about a high bridging score on their comment.
 */
export async function notifyBridgingAchievement(
  commentId: string,
  userId: string,
  score: number,
): Promise<void> {
  try {
    await createNotification({
      userId,
      type: 'bridging_achievement',
      title: 'Bridging-Auszeichnung',
      description: `Dein Kommentar hat einen Bridging-Score von ${score} erreicht!`,
      payload: {
        comment_id: commentId,
        score,
      },
      href: `/kommentare/${commentId}`,
    });
  } catch (err) {
    console.error('[notification-triggers] notifyBridgingAchievement fehlgeschlagen:', err);
  }
}

// ─── 6. notifyStreakMilestone ────────────────────────────────────────

/**
 * Notifies a user about a streak milestone.
 * Triggered at 7, 14, 30, 60, and 100 days.
 */
export async function notifyStreakMilestone(
  userId: string,
  streakDays: number,
): Promise<void> {
  try {
    const milestones = [7, 14, 30, 60, 100];
    if (!milestones.includes(streakDays)) return;

    await createNotification({
      userId,
      type: 'streak_milestone',
      title: 'Streak-Meilenstein',
      description: `Glückwunsch! Du hast ${streakDays} Tage in Folge teilgenommen!`,
      payload: { streak_days: streakDays },
      href: '/profil',
    });
  } catch (err) {
    console.error('[notification-triggers] notifyStreakMilestone fehlgeschlagen:', err);
  }
}

// ─── 7. notifyQuestComplete ─────────────────────────────────────────

/**
 * Notifies a user when they complete a quest.
 */
export async function notifyQuestComplete(
  userId: string,
  questTitle: string,
): Promise<void> {
  try {
    await createNotification({
      userId,
      type: 'quest_complete',
      title: 'Quest abgeschlossen',
      description: `Du hast die Quest "${questTitle}" abgeschlossen!`,
      payload: { quest_title: questTitle },
      href: '/quests',
    });
  } catch (err) {
    console.error('[notification-triggers] notifyQuestComplete fehlgeschlagen:', err);
  }
}

// ─── 8. notifyWahlkreisUpdate ───────────────────────────────────────

/**
 * Batch-notifies all users in a wahlkreis about an update.
 */
export async function notifyWahlkreisUpdate(
  wahlkreisId: string,
  updateType: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('wahlkreis_id', wahlkreisId);

    if (error || !data) return;

    const rows = data as AnyRow[];
    const batches = chunk(rows, 100);

    for (const batch of batches) {
      const notifications: CreateNotificationParams[] = batch.map((row: AnyRow) => ({
        userId: row.id as string,
        type: 'wahlkreis_update' as const,
        title: 'Wahlkreis-Update',
        description: (payload.description as string) || `Neues Update in deinem Wahlkreis: ${updateType}`,
        payload: { wahlkreis_id: wahlkreisId, update_type: updateType, ...payload },
        href: `/wahlkreis/${wahlkreisId}`,
      }));
      await createBulkNotifications(notifications);
    }
  } catch (err) {
    console.error('[notification-triggers] notifyWahlkreisUpdate fehlgeschlagen:', err);
  }
}

// ─── 9. notifyMdbVoted ──────────────────────────────────────────────

/**
 * Notifies users in a wahlkreis when their MdB votes in the Bundestag.
 */
export async function notifyMdbVoted(
  topicId: string,
  mdbName: string,
  party: string,
  wahlkreisId: string,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('wahlkreis_id', wahlkreisId);

    if (error || !data) return;

    const rows = data as AnyRow[];
    const batches = chunk(rows, 100);

    for (const batch of batches) {
      const notifications: CreateNotificationParams[] = batch.map((row: AnyRow) => ({
        userId: row.id as string,
        type: 'mdb_voted' as const,
        title: 'MdB-Abstimmung',
        description: `${mdbName} (${party}) hat im Bundestag abgestimmt.`,
        payload: {
          topic_id: topicId,
          mdb_name: mdbName,
          party,
          wahlkreis_id: wahlkreisId,
        },
        href: `/themen/${topicId}/ergebnis`,
      }));
      await createBulkNotifications(notifications);
    }
  } catch (err) {
    console.error('[notification-triggers] notifyMdbVoted fehlgeschlagen:', err);
  }
}

// ─── 10. notifyTopicActivated ───────────────────────────────────────

/**
 * Notifies the creator of a topic when it gets activated.
 */
export async function notifyTopicActivated(
  topicId: string,
  creatorId: string,
  title: string,
): Promise<void> {
  try {
    await createNotification({
      userId: creatorId,
      type: 'topic_activated',
      title: 'Thema aktiviert',
      description: `"${title}" wurde aktiviert und ist jetzt sichtbar.`,
      payload: {
        topic_id: topicId,
        title,
      },
      href: `/themen/${topicId}`,
    });
  } catch (err) {
    console.error('[notification-triggers] notifyTopicActivated fehlgeschlagen:', err);
  }
}

// ─── 11. notifySystem ───────────────────────────────────────────────

/**
 * Sends a system announcement notification to a single user.
 */
export async function notifySystem(
  userId: string,
  message: string,
): Promise<void> {
  try {
    await createNotification({
      userId,
      type: 'system',
      title: 'Systemnachricht',
      description: message,
      payload: {},
    });
  } catch (err) {
    console.error('[notification-triggers] notifySystem fehlgeschlagen:', err);
  }
}

// ─── Bonus Triggers (extended set) ──────────────────────────────────

/**
 * Notifies voters and bookmarkers 24h before a topic closes.
 */
export async function notifyTopicClosing(
  topicId: string,
  title: string,
  closesAt: string,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Collect users who voted
    const { data: voters, error: votersError } = await supabase
      .from('vote_events')
      .select('user_id')
      .eq('topic_id', topicId);

    // Collect users who bookmarked
    const { data: bookmarkers, error: bookmarkError } = await supabase
      .from('bookmarks')
      .select('user_id')
      .eq('topic_id', topicId);

    const voterIds = votersError || !voters
      ? []
      : (voters as AnyRow[]).map((r: AnyRow) => r.user_id as string);

    const bookmarkerIds = bookmarkError || !bookmarkers
      ? []
      : (bookmarkers as AnyRow[]).map((r: AnyRow) => r.user_id as string);

    // Deduplicate
    const uniqueUserIds = [...new Set([...voterIds, ...bookmarkerIds])];
    const batches = chunk(uniqueUserIds, 100);

    for (const batch of batches) {
      const notifications: CreateNotificationParams[] = batch.map((userId) => ({
        userId,
        type: 'topic_closing' as const,
        title: 'Thema schließt bald',
        description: `"${title}" schließt in 24 Stunden.`,
        payload: { topic_id: topicId, closes_at: closesAt },
        href: `/themen/${topicId}`,
      }));
      await createBulkNotifications(notifications);
    }
  } catch (err) {
    console.error('[notification-triggers] notifyTopicClosing fehlgeschlagen:', err);
  }
}

/**
 * Notifies a user about a privilege upgrade.
 */
export async function notifyPrivilegeUpgrade(
  userId: string,
  newTier: number,
): Promise<void> {
  try {
    const tierNames: Record<number, string> = {
      1: 'Beobachter',
      2: 'Bürger',
      3: 'Aktiver Bürger',
      4: 'Vertrauensperson',
      5: 'Moderator',
    };

    const tierName = tierNames[newTier] || `Stufe ${newTier}`;

    await createNotification({
      userId,
      type: 'privilege_upgrade',
      title: 'Neues Privileg freigeschaltet',
      description: `Du hast ${tierName} (Stufe ${newTier}) erreicht!`,
      payload: { new_tier: newTier, tier_name: tierName },
      href: '/profil',
    });
  } catch (err) {
    console.error('[notification-triggers] notifyPrivilegeUpgrade fehlgeschlagen:', err);
  }
}

/**
 * Notifies the topic creator when supporter milestones are reached (5, 10).
 */
export async function notifySupporterMilestone(
  topicId: string,
  title: string,
  count: number,
): Promise<void> {
  try {
    const milestones = [5, 10];
    if (!milestones.includes(count)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Get topic creator
    const { data: topic, error } = await supabase
      .from('topics')
      .select('created_by')
      .eq('id', topicId)
      .single();

    if (error || !topic) return;

    const creatorId = (topic as AnyRow).created_by as string;

    await createNotification({
      userId: creatorId,
      type: 'supporter_milestone',
      title: 'Unterstützer-Meilenstein',
      description: `"${title}" hat ${count} Unterstützer erreicht!`,
      payload: { topic_id: topicId, count },
      href: `/themen/${topicId}`,
    });
  } catch (err) {
    console.error('[notification-triggers] notifySupporterMilestone fehlgeschlagen:', err);
  }
}
