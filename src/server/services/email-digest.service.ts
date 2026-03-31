/**
 * Phase 151 -- Weekly Digest Service
 *
 * Generiert und versendet woechentliche Zusammenfassungen
 * an alle Nutzer mit aktivierter Digest-Einstellung.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from './email.service';
import { weeklyDigestEmail } from './email-templates';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

/** Batch-Groesse fuer den Versand. */
const BATCH_SIZE = 50;

/** Pause zwischen Batches in Millisekunden. */
const BATCH_DELAY_MS = 1000;

/**
 * Hilfsfunktion: Wartet eine bestimmte Anzahl Millisekunden.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Berechnet das Datum vor 7 Tagen in CET.
 */
function getWeekAgoCET(): string {
  const now = new Date();
  now.setDate(now.getDate() - 7);
  return now.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

/**
 * Laedt die Wochen-Statistiken eines Nutzers.
 */
async function getUserWeeklyStats(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
): Promise<{
  votesThisWeek: number;
  topTopics: Array<{ title: string; voteCount: number }>;
  streakDays: number;
}> {
  const weekAgo = getWeekAgoCET();

  // Abstimmungen diese Woche
  const { count: votesThisWeek } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${weekAgo}T00:00:00Z`);

  // Top-Themen dieser Woche (nach Stimmenzahl)
  const { data: topTopicsData } = await supabase
    .from('topics')
    .select('title, vote_count')
    .gte('created_at', `${weekAgo}T00:00:00Z`)
    .order('vote_count', { ascending: false })
    .limit(3);

  const topTopics = (topTopicsData ?? []).map((row: AnyRow) => ({
    title: row.title as string,
    voteCount: (row.vote_count as number) ?? 0,
  }));

  // Aktuelle Streak
  const { data: streakData } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single();

  const streakDays = streakData ? (streakData as AnyRow).current_streak as number : 0;

  return {
    votesThisWeek: votesThisWeek ?? 0,
    topTopics,
    streakDays,
  };
}

/**
 * Versendet den woechentlichen Digest an alle berechtigten Nutzer.
 *
 * @returns Anzahl der gesendeten Emails und Fehler.
 */
export async function sendWeeklyDigests(): Promise<{ sent: number; errors: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  let sent = 0;
  let errors = 0;

  // Nutzer mit aktiviertem Weekly Digest laden
  const { data: users, error: usersError } = await supabase
    .from('user_preferences')
    .select('user_id')
    .eq('weekly_digest', true);

  if (usersError || !users || users.length === 0) {
    if (usersError) {
      console.error('[email-digest] Nutzer-Abfrage fehlgeschlagen:', usersError);
    }
    return { sent, errors };
  }

  // Nutzer-Profile mit Email laden
  const userIds = (users as AnyRow[]).map((u: AnyRow) => u.user_id as string);

  // In Batches verarbeiten
  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (userId: string) => {
      try {
        // Profil mit Email laden
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', userId)
          .single();

        if (!profile) return;

        const row = profile as AnyRow;
        const email = row.email as string | null;
        const displayName = (row.display_name as string) || 'Demokrat-Nutzer';

        if (!email) return;

        // Statistiken laden
        const stats = await getUserWeeklyStats(supabase, userId);

        // Email generieren und versenden
        const template = weeklyDigestEmail(displayName, stats);
        const result = await sendEmail({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });

        if (result) {
          sent++;
        } else {
          errors++;
        }
      } catch (err) {
        console.error(`[email-digest] Fehler fuer Nutzer ${userId}:`, err);
        errors++;
      }
    });

    await Promise.all(batchPromises);

    // Pause zwischen Batches (ausser nach dem letzten)
    if (i + BATCH_SIZE < userIds.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  console.log(`[email-digest] Versand abgeschlossen: ${sent} gesendet, ${errors} Fehler`);
  return { sent, errors };
}
