/**
 * Phase 150 -- Push Subscription Router
 *
 * Verwaltet Web-Push-Subscriptions der Nutzer.
 */

import { z } from 'zod/v4';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import {
  savePushSubscription,
  removePushSubscription,
  getUserSubscriptions,
} from '../services/web-push.service';

export const pushRouter = router({
  /**
   * Registriert eine Push-Subscription fuer den aktuellen Nutzer.
   */
  subscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await savePushSubscription(ctx.user.id, {
        endpoint: input.endpoint,
        keys: input.keys,
      });

      return { success: true };
    }),

  /**
   * Entfernt eine Push-Subscription des aktuellen Nutzers.
   */
  unsubscribe: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await removePushSubscription(ctx.user.id, input.endpoint);

      return { success: true };
    }),

  /**
   * Gibt den Subscription-Status des aktuellen Nutzers zurueck.
   */
  status: protectedProcedure.query(async ({ ctx }) => {
    const subscriptions = await getUserSubscriptions(ctx.user.id);

    return {
      subscribed: subscriptions.length > 0,
      subscriptionCount: subscriptions.length,
    };
  }),

  /**
   * Gibt den oeffentlichen VAPID-Key zurueck (fuer die Client-Registrierung).
   */
  vapidPublicKey: publicProcedure.query(() => {
    return { key: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '' };
  }),
});
