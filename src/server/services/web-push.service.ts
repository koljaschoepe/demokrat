/**
 * Phase 150 -- Web Push Notification Service
 *
 * Verwaltet Push-Subscriptions und steuert den Versand.
 * Da VAPID-Signierung ohne npm-Pakete nicht moeglich ist,
 * wird der tatsaechliche Versand in eine push_queue geschrieben
 * und von einer Supabase Edge Function verarbeitet.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ---------------------------------------------------------------------------
// Konstanten
// ---------------------------------------------------------------------------

/** Nur diese Notification-Typen loesen einen Push aus. */
export const PUSH_ELIGIBLE_TYPES = [
  'new_vote',
  'bundestag_result',
  'streak_milestone',
] as const;

/** Maximale Push-Nachrichten pro Nutzer und Tag. */
export const MAX_PUSH_PER_DAY = 3;

// ---------------------------------------------------------------------------
// Subscription-Verwaltung
// ---------------------------------------------------------------------------

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Speichert eine Push-Subscription fuer einen Nutzer.
 * Upsert anhand von (user_id, endpoint).
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionData,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,endpoint' },
  );

  if (error) {
    console.error('[web-push] savePushSubscription fehlgeschlagen:', error);
  }
}

/**
 * Entfernt eine Push-Subscription fuer einen Nutzer.
 */
export async function removePushSubscription(
  userId: string,
  endpoint: string,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint);

  if (error) {
    console.error('[web-push] removePushSubscription fehlgeschlagen:', error);
  }
}

/**
 * Gibt alle Push-Subscriptions eines Nutzers zurueck.
 */
export async function getUserSubscriptions(
  userId: string,
): Promise<Array<{ endpoint: string; p256dh: string; auth: string }>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (error) {
    console.error('[web-push] getUserSubscriptions fehlgeschlagen:', error);
    return [];
  }

  return (data ?? []).map((row: AnyRow) => ({
    endpoint: row.endpoint as string,
    p256dh: row.p256dh as string,
    auth: row.auth as string,
  }));
}

// ---------------------------------------------------------------------------
// Push-Versand (Queue-basiert)
// ---------------------------------------------------------------------------

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

/**
 * Sendet eine Push-Benachrichtigung an alle Subscriptions eines Nutzers.
 * Da VAPID-Signierung ohne externe Pakete nicht implementierbar ist,
 * werden die Nachrichten in die push_queue Tabelle geschrieben.
 * Eine Supabase Edge Function verarbeitet diese Queue.
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload,
): Promise<void> {
  const subscriptions = await getUserSubscriptions(userId);

  if (subscriptions.length === 0) return;

  for (const sub of subscriptions) {
    await sendPushToSubscription(
      { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
      payload,
    );
  }
}

/**
 * Sendet eine Push-Benachrichtigung an einen Nutzer mit Rate-Limit-Pruefung.
 * Respektiert das Tageslimit von MAX_PUSH_PER_DAY.
 * Gibt zurueck, ob die Nachricht gesendet wurde.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<boolean> {
  const allowed = await canSendPush(userId);
  if (!allowed) {
    console.log(`[web-push] Tageslimit erreicht fuer Nutzer ${userId}`);
    return false;
  }

  const subscriptions = await getUserSubscriptions(userId);
  if (subscriptions.length === 0) return false;

  for (const sub of subscriptions) {
    await sendPushToSubscription(
      { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
      payload,
    );
  }

  await trackPushSent(userId);
  return true;
}

/**
 * Schreibt eine Push-Nachricht in die push_queue Tabelle.
 * Die tatsaechliche Zustellung erfolgt ueber eine Supabase Edge Function,
 * die VAPID-Signierung und den Web Push Protocol Versand uebernimmt.
 */
export async function sendPushToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { error } = await supabase.from('push_queue').insert({
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      payload: JSON.stringify(payload),
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[web-push] sendPushToSubscription Queue-Insert fehlgeschlagen:', error);
    }
  } catch (err) {
    console.error('[web-push] sendPushToSubscription fehlgeschlagen:', err);
  }
}

// ---------------------------------------------------------------------------
// Rate-Limiting
// ---------------------------------------------------------------------------

/**
 * Gibt das heutige Datum in CET als YYYY-MM-DD zurueck.
 */
function getTodayCET(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

/**
 * Prueft ob ein Nutzer heute noch Push-Nachrichten erhalten darf.
 */
export async function canSendPush(userId: string): Promise<boolean> {
  const date = getTodayCET();
  const key = `push:daily:${userId}:${date}`;
  const count = await cache.get<number>(key);
  return (count ?? 0) < MAX_PUSH_PER_DAY;
}

/**
 * Zaehlt eine gesendete Push-Nachricht fuer das Tageslimit.
 * Setzt einen 24h TTL auf den Counter.
 */
export async function trackPushSent(userId: string): Promise<void> {
  const date = getTodayCET();
  const key = `push:daily:${userId}:${date}`;
  const newCount = await cache.incr(key);

  // TTL nur beim ersten Increment setzen
  if (newCount === 1) {
    await cache.expire(key, 86400); // 24 Stunden
  }
}
