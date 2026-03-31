/**
 * Phase 148 — tRPC Notifications Router
 *
 * Endpunkte fuer Benachrichtigungen: Auflisten, Zaehler fuer
 * ungelesene, Einzeln/Alle als gelesen markieren.
 */

import { z } from 'zod/v4';
import { router, protectedProcedure } from '../trpc';
import {
  getUnreadCount,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from '@/server/services/notification.service';
import { cache } from '@/lib/redis/cache';

// ─── Router ──────────────────────────────────────────────────────────

export const notificationsRouter = router({
  /**
   * Paginated list of notifications for the current user.
   * Returns notifications, cursor for next page, and unread count.
   */
  list: protectedProcedure
    .input(
      z.object({
        filter: z.enum(['all', 'unread']).optional().default('all'),
        cursor: z.number().optional(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Convert numeric cursor to ISO string for pagination
      // The cursor is an offset-based index; we use created_at for keyset pagination
      // For the API we accept a string cursor internally but expose number for simplicity
      const cursorStr = input.cursor !== undefined
        ? new Date(input.cursor).toISOString()
        : undefined;

      const readFilter = input.filter === 'unread' ? false : undefined;

      const { notifications, nextCursor } = await getUserNotifications({
        userId,
        read: readFilter,
        cursor: cursorStr,
        limit: input.limit,
      });

      const unreadCount = await getUnreadCount(userId);

      // Convert string cursor back to number for the client
      const nextCursorNum = nextCursor
        ? new Date(nextCursor).getTime()
        : null;

      return {
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          description: n.description,
          href: n.href,
          payload: n.payload,
          read: n.read,
          createdAt: n.createdAt,
        })),
        nextCursor: nextCursorNum,
        unreadCount,
      };
    }),

  /**
   * Count of unread notifications (Redis-cached for 30s).
   */
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const redisKey = `notifications:unread:${userId}`;

    // Try Redis first
    const cached = await cache.get<number>(redisKey);
    if (cached !== null && cached !== undefined) {
      return { count: Math.max(0, cached) };
    }

    // Fallback to service (which also caches)
    const count = await getUnreadCount(userId);

    // Cache in Redis for 30s
    await cache.set(redisKey, count, 30);

    return { count };
  }),

  /**
   * Mark a single notification as read.
   * Invalidates the unread count cache.
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const success = await markAsRead(userId, input.id);

      if (success) {
        // Invalidate Redis cache
        const redisKey = `notifications:unread:${userId}`;
        await cache.del(redisKey);
      }

      return { success };
    }),

  /**
   * Mark all notifications as read for the current user.
   * Invalidates the unread count cache.
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    const updated = await markAllAsRead(userId);

    if (updated > 0) {
      // Invalidate Redis cache
      const redisKey = `notifications:unread:${userId}`;
      await cache.del(redisKey);
    }

    return { updated };
  }),
});
