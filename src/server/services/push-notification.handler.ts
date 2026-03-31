/**
 * Phase 150 -- Push Notification Handler
 *
 * Entscheidet ob fuer eine Benachrichtigung ein Push gesendet wird.
 * Prueft Typ-Eligibility und Tageslimit.
 */

import {
  PUSH_ELIGIBLE_TYPES,
  canSendPush,
  sendPushNotification,
  trackPushSent,
} from './web-push.service';

/**
 * Verarbeitet eine Benachrichtigung und sendet ggf. einen Push.
 *
 * @param userId  - Empfaenger
 * @param type    - Benachrichtigungstyp (z.B. 'new_vote')
 * @param title   - Push-Titel
 * @param body    - Push-Nachricht
 * @param url     - Optionaler Deep-Link
 */
export async function handlePushForNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  url?: string,
): Promise<void> {
  try {
    // Nur bestimmte Typen loesen Push aus
    if (!PUSH_ELIGIBLE_TYPES.includes(type as (typeof PUSH_ELIGIBLE_TYPES)[number])) {
      return;
    }

    // Tageslimit pruefen
    const allowed = await canSendPush(userId);
    if (!allowed) {
      return;
    }

    // Push senden und Zaehler erhoehen
    await sendPushNotification(userId, { title, body, url });
    await trackPushSent(userId);
  } catch (err) {
    // Push ist nicht kritisch — Fehler loggen, aber nicht werfen
    console.error('[push-handler] handlePushForNotification fehlgeschlagen:', err);
  }
}
