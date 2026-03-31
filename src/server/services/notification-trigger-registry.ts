/**
 * Phase 149 — Notification Trigger Registry
 *
 * Zentrale Registry die Events auf Trigger-Funktionen abbildet.
 * Ermoeglicht entkoppeltes Ausloesen von Benachrichtigungen
 * aus beliebigen Stellen im Code.
 */

import {
  notifyCommentReply,
  notifyBridgingAchievement,
  notifyTopicActivated,
  notifyNewVote,
  notifyVoteResult,
  notifyBundestagResult,
  notifyStreakMilestone,
  notifyQuestComplete,
  notifyWahlkreisUpdate,
  notifyMdbVoted,
  notifyTopicClosing,
  notifyPrivilegeUpgrade,
  notifySupporterMilestone,
  notifySystem,
} from '@/server/services/notification-triggers';

// ─── Event Types ─────────────────────────────────────────────────────

export type NotificationEvent =
  | 'vote:new'
  | 'vote:result'
  | 'vote:closing'
  | 'bundestag:result'
  | 'comment:reply'
  | 'comment:bridging'
  | 'topic:activated'
  | 'topic:closing'
  | 'streak:milestone'
  | 'quest:complete'
  | 'wahlkreis:update'
  | 'mdb:voted'
  | 'privilege:upgrade'
  | 'supporter:milestone'
  | 'system';

// ─── Event Handlers ──────────────────────────────────────────────────

type EventHandler = (data: Record<string, unknown>) => Promise<void>;

const handlers: Record<NotificationEvent, EventHandler> = {
  'vote:new': async (data) => {
    await notifyNewVote(
      data.topicId as string,
      data.voterCount as number,
    );
  },

  'vote:result': async (data) => {
    await notifyVoteResult(
      data.topicId as string,
      data.title as string,
    );
  },

  'vote:closing': async (data) => {
    await notifyTopicClosing(
      data.topicId as string,
      data.title as string,
      data.closesAt as string,
    );
  },

  'bundestag:result': async (data) => {
    await notifyBundestagResult(
      data.topicId as string,
      data.title as string,
      data.bundestagResult as string,
    );
  },

  'comment:reply': async (data) => {
    await notifyCommentReply(
      data.commentId as string,
      data.replyAuthorId as string,
    );
  },

  'comment:bridging': async (data) => {
    await notifyBridgingAchievement(
      data.commentId as string,
      data.userId as string,
      data.score as number,
    );
  },

  'topic:activated': async (data) => {
    await notifyTopicActivated(
      data.topicId as string,
      data.creatorId as string,
      data.title as string,
    );
  },

  'topic:closing': async (data) => {
    await notifyTopicClosing(
      data.topicId as string,
      data.title as string,
      data.closesAt as string,
    );
  },

  'streak:milestone': async (data) => {
    await notifyStreakMilestone(
      data.userId as string,
      data.streakDays as number,
    );
  },

  'quest:complete': async (data) => {
    await notifyQuestComplete(
      data.userId as string,
      data.questTitle as string,
    );
  },

  'wahlkreis:update': async (data) => {
    await notifyWahlkreisUpdate(
      data.wahlkreisId as string,
      data.updateType as string,
      (data.payload as Record<string, unknown>) ?? {},
    );
  },

  'mdb:voted': async (data) => {
    await notifyMdbVoted(
      data.topicId as string,
      data.mdbName as string,
      data.party as string,
      data.wahlkreisId as string,
    );
  },

  'privilege:upgrade': async (data) => {
    await notifyPrivilegeUpgrade(
      data.userId as string,
      data.newTier as number,
    );
  },

  'supporter:milestone': async (data) => {
    await notifySupporterMilestone(
      data.topicId as string,
      data.title as string,
      data.count as number,
    );
  },

  'system': async (data) => {
    await notifySystem(
      data.userId as string,
      data.message as string,
    );
  },
};

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Triggers a notification event. Resolves the event to the correct
 * trigger function and executes it. Never throws — all errors are
 * caught and logged.
 */
export async function triggerNotification(
  event: NotificationEvent,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const handler = handlers[event];
    if (!handler) {
      console.error(`[notification-trigger-registry] Unbekanntes Event: ${event}`);
      return;
    }

    await handler(data);
  } catch (err) {
    console.error(`[notification-trigger-registry] Fehler bei Event "${event}":`, err);
  }
}
