/**
 * Phase 150 -- Client-Side Push Subscription Helper
 *
 * Verwaltet die Web-Push-Subscription im Browser.
 * Nutzt die Service Worker Push API und kommuniziert
 * mit dem Server ueber tRPC.
 */

'use client';

import { trpc } from '@/lib/trpc/client';

// ---------------------------------------------------------------------------
// Feature Detection
// ---------------------------------------------------------------------------

/**
 * Prueft ob der Browser Web Push unterstuetzt.
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator)) return false;
  if (!('PushManager' in window)) return false;
  if (!('Notification' in window)) return false;
  return true;
}

/**
 * Prueft ob der Nutzer bereits eine aktive Push-Subscription hat.
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Subscription Management
// ---------------------------------------------------------------------------

/**
 * Konvertiert einen Base64-URL-String in ein Uint8Array.
 * Wird benoetigt, um den VAPID Public Key fuer die PushManager API
 * in das richtige Format zu bringen.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Fordert Benachrichtigungs-Berechtigung an, erstellt eine Push-Subscription
 * beim Service Worker und sendet die Subscription-Daten an den Server.
 *
 * @returns `true` wenn erfolgreich, `false` bei Fehler oder Ablehnung.
 */
export async function subscribeToPush(
  trpcClient: ReturnType<typeof trpc.useUtils>,
): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('[push] Web Push wird von diesem Browser nicht unterstuetzt');
    return false;
  }

  try {
    // Berechtigung anfordern
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[push] Benachrichtigungs-Berechtigung abgelehnt');
      return false;
    }

    // VAPID Public Key aus Umgebungsvariable
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY ist nicht konfiguriert');
      return false;
    }

    // Service Worker Registrierung abwarten
    const registration = await navigator.serviceWorker.ready;

    // Bestehende Subscription pruefen
    let subscription = await registration.pushManager.getSubscription();

    // Neue Subscription erstellen falls noetig
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
      });
    }

    // Subscription-Daten extrahieren
    const subscriptionJson = subscription.toJSON();
    const endpoint = subscription.endpoint;
    const p256dh = subscriptionJson.keys?.p256dh;
    const auth = subscriptionJson.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      console.error('[push] Unvollstaendige Subscription-Daten');
      return false;
    }

    // An Server senden via tRPC
    await trpcClient.client.push.subscribe.mutate({
      endpoint,
      keys: { p256dh, auth },
    });

    return true;
  } catch (err) {
    console.error('[push] subscribeToPush fehlgeschlagen:', err);
    return false;
  }
}

/**
 * Entfernt die aktive Push-Subscription beim Browser und Server.
 *
 * @returns `true` wenn erfolgreich, `false` bei Fehler.
 */
export async function unsubscribeFromPush(
  trpcClient: ReturnType<typeof trpc.useUtils>,
): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Keine aktive Subscription vorhanden
      return true;
    }

    const endpoint = subscription.endpoint;

    // Browser-Subscription entfernen
    await subscription.unsubscribe();

    // Server-Subscription entfernen via tRPC
    await trpcClient.client.push.unsubscribe.mutate({ endpoint });

    return true;
  } catch (err) {
    console.error('[push] unsubscribeFromPush fehlgeschlagen:', err);
    return false;
  }
}

/**
 * Gibt den aktuellen Benachrichtigungs-Berechtigungsstatus zurueck.
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}
