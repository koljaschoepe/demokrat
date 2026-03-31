/**
 * Phase 148 — Notification Service Core
 *
 * Zentrale Benachrichtigungserstellung mit Praeferenzpruefung,
 * Redis-Counter fuer ungelesene Nachrichten, paginierte Abfrage
 * und Gelesen-Markierung.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import { shouldNotify } from '@/server/services/notification-preferences';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ─── Notification Types ──────────────────────────────────────────────

export const NOTIFICATION_TYPES = [
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
  'system',
  'topic_closing',
  'badge_earned',
  'streak_reminder',
  'new_topic',
  'supporter_milestone',
  'privilege_upgrade',
  'sitzungswoche',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ─── Params ──────────────────────────────────────────────────────────

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  payload?: Record<string, unknown>;
  href?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string | null;
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// ─── Core Functions ──────────────────────────────────────────────────

/**
 * Creates a single notification for a user, respecting their preferences.
 * Returns the created notification or null if user opted out.
 */
export async function createNotification(
  params: CreateNotificationParams,
): Promise<Notification | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Check user preferences
    const allowed = await shouldNotify(params.userId, params.type);
    if (!allowed) return null;

    const payload: Record<string, unknown> = {
      ...params.payload,
      title: params.title,
      description: params.description,
    };

    if (params.href) {
      payload.href = params.href;
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        payload,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select('id, type, payload, read, created_at')
      .single();

    if (error || !data) {
      console.error('[notification.service] createNotification insert fehlgeschlagen:', error);
      return null;
    }

    // Increment unread counter in Redis
    const redisKey = `notifications:unread:${params.userId}`;
    await cache.incr(redisKey);

    const row = data as AnyRow;
    return {
      id: row.id as string,
      type: row.type as string,
      title: params.title,
      description: params.description,
      href: params.href ?? null,
      payload: (row.payload ?? {}) as Record<string, unknown>,
      read: false,
      createdAt: row.created_at as string,
    };
  } catch (err) {
    console.error('[notification.service] createNotification fehlgeschlagen:', err);
    return null;
  }
}

/**
 * Creates notifications for multiple users in a single batch.
 * Each notification still respects individual user preferences.
 */
export async function createBulkNotifications(
  notifications: CreateNotificationParams[],
): Promise<void> {
  if (notifications.length === 0) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Check preferences for each notification
    const allowedNotifications: CreateNotificationParams[] = [];

    for (const n of notifications) {
      const allowed = await shouldNotify(n.userId, n.type);
      if (allowed) {
        allowedNotifications.push(n);
      }
    }

    if (allowedNotifications.length === 0) return;

    // Build insert rows
    const rows = allowedNotifications.map((n) => {
      const payload: Record<string, unknown> = {
        ...n.payload,
        title: n.title,
        description: n.description,
      };
      if (n.href) {
        payload.href = n.href;
      }
      return {
        user_id: n.userId,
        type: n.type,
        payload,
        read: false,
        created_at: new Date().toISOString(),
      };
    });

    // Batch insert (Supabase handles arrays natively)
    await supabase.from('notifications').insert(rows);

    // Increment Redis counters for each user
    const userIds = new Set(allowedNotifications.map((n) => n.userId));
    for (const userId of userIds) {
      const count = allowedNotifications.filter((n) => n.userId === userId).length;
      for (let i = 0; i < count; i++) {
        await cache.incr(`notifications:unread:${userId}`);
      }
    }
  } catch (err) {
    console.error('[notification.service] createBulkNotifications fehlgeschlagen:', err);
  }
}

// ─── Query Functions ────────────────────────────────────────────────

/**
 * Returns the count of unread notifications for a user.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    // Try Redis first
    const redisKey = `notifications:unread:${userId}`;
    const cached = await cache.get<number>(redisKey);
    if (cached !== null && cached !== undefined) {
      return Math.max(0, cached);
    }

    // Fallback to DB count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    const unreadCount = error ? 0 : (count ?? 0);

    // Cache in Redis for 30s
    await cache.set(redisKey, unreadCount, 30);

    return unreadCount;
  } catch (err) {
    console.error('[notification.service] getUnreadCount fehlgeschlagen:', err);
    return 0;
  }
}

/**
 * Returns a paginated list of notifications for a user.
 */
export async function getUserNotifications({
  userId,
  read,
  cursor,
  limit = 20,
}: {
  userId: string;
  read?: boolean;
  cursor?: string;
  limit?: number;
}): Promise<{ notifications: Notification[]; nextCursor: string | null }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    let query = supabase
      .from('notifications')
      .select('id, type, payload, read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (read !== undefined) {
      query = query.eq('read', read);
    }

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[notification.service] getUserNotifications fehlgeschlagen:', error);
      return { notifications: [], nextCursor: null };
    }

    const rows = (data ?? []) as AnyRow[];
    const hasMore = rows.length > limit;
    const sliced = hasMore ? rows.slice(0, limit) : rows;

    const notifications: Notification[] = sliced.map((row: AnyRow) => {
      const payload = (row.payload ?? {}) as Record<string, unknown>;
      const title = (payload.title as string) || 'Benachrichtigung';
      const description = (payload.description as string) || '';

      return {
        id: row.id as string,
        type: row.type as string,
        title,
        description,
        href: (payload.href as string) ?? null,
        payload,
        read: row.read as boolean,
        createdAt: row.created_at as string,
      };
    });

    const nextCursor = hasMore
      ? (sliced[sliced.length - 1] as AnyRow).created_at as string
      : null;

    return { notifications, nextCursor };
  } catch (err) {
    console.error('[notification.service] getUserNotifications fehlgeschlagen:', err);
    return { notifications: [], nextCursor: null };
  }
}

/**
 * Marks a single notification as read. Performs ownership check.
 * Returns true if the notification was updated.
 */
export async function markAsRead(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .eq('read', false)
      .select('id');

    if (error) {
      console.error('[notification.service] markAsRead fehlgeschlagen:', error);
      return false;
    }

    const updated = (data ?? []) as AnyRow[];

    if (updated.length > 0) {
      // Invalidate Redis cache so next read recalculates
      const redisKey = `notifications:unread:${userId}`;
      await cache.del(redisKey);
    }

    return updated.length > 0;
  } catch (err) {
    console.error('[notification.service] markAsRead fehlgeschlagen:', err);
    return false;
  }
}

/**
 * Marks all notifications as read for a user.
 * Returns the count of updated notifications.
 */
export async function markAllAsRead(userId: string): Promise<number> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    // Count how many will be updated
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (countError) {
      console.error('[notification.service] markAllAsRead count fehlgeschlagen:', countError);
      return 0;
    }

    const toUpdate = unreadCount ?? 0;
    if (toUpdate === 0) return 0;

    // Mark all as read
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (updateError) {
      console.error('[notification.service] markAllAsRead update fehlgeschlagen:', updateError);
      return 0;
    }

    // Invalidate Redis cache
    const redisKey = `notifications:unread:${userId}`;
    await cache.del(redisKey);

    return toUpdate;
  } catch (err) {
    console.error('[notification.service] markAllAsRead fehlgeschlagen:', err);
    return 0;
  }
}
