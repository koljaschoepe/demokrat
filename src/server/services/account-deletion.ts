import { createAdminClient } from '@/lib/supabase/admin';

/**
 * DSGVO Art. 17 — Recht auf Löschung.
 * Löscht alle personenbezogenen Daten und den Auth-Account.
 *
 * Ablauf:
 * 1. Nutzereinstellungen löschen
 * 2. Benachrichtigungen löschen
 * 3. Reputations-Events löschen
 * 4. Auth-User löschen (cascaded auf profiles via FK)
 *
 * Hinweis: vote_events sind append-only. Durch die Löschung des
 * Auth-Users wird der FK auf NULL gesetzt oder durch die DB-Cascade
 * behandelt. Abstimmungsergebnisse (Aggregate) bleiben anonym erhalten.
 * Kommentare werden durch die Cascade anonymisiert.
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  const supabase = createAdminClient();

  // 1. Nutzereinstellungen löschen
  const { error: prefsError } = await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', userId);
  if (prefsError) {
    throw new Error(
      `Fehler beim Löschen der Einstellungen: ${prefsError.message}`,
    );
  }

  // 2. Benachrichtigungen löschen
  const { error: notifError } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);
  if (notifError) {
    throw new Error(
      `Fehler beim Löschen der Benachrichtigungen: ${notifError.message}`,
    );
  }

  // 3. Reputations-Events löschen
  const { error: repError } = await supabase
    .from('reputation_events')
    .delete()
    .eq('user_id', userId);
  if (repError) {
    throw new Error(
      `Fehler beim Löschen der Reputation: ${repError.message}`,
    );
  }

  // 4. Auth-User löschen (cascaded auf profiles via FK)
  // vote_events und comments werden durch DB-Cascades/Policies behandelt
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) {
    throw new Error(`Fehler beim Löschen des Accounts: ${authError.message}`);
  }
}
