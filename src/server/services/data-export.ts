import { createAdminClient } from '@/lib/supabase/admin';

export interface DataExport {
  exported_at: string;
  profile: Record<string, unknown> | null;
  preferences: Record<string, unknown> | null;
  votes: Record<string, unknown>[];
  comments: Record<string, unknown>[];
  reputation: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
}

/**
 * DSGVO Art. 20 — Recht auf Datenübertragbarkeit.
 * Sammelt alle personenbezogenen Daten eines Nutzers in einem
 * maschinenlesbaren Format (JSON).
 */
export async function generateDataExport(userId: string): Promise<DataExport> {
  const supabase = createAdminClient();

  const [profile, preferences, votes, comments, reputation, notifications] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('vote_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('comments')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('reputation_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);

  return {
    exported_at: new Date().toISOString(),
    profile: profile.data as Record<string, unknown> | null,
    preferences: preferences.data as Record<string, unknown> | null,
    votes: (votes.data as Record<string, unknown>[] | null) ?? [],
    comments: (comments.data as Record<string, unknown>[] | null) ?? [],
    reputation: (reputation.data as Record<string, unknown>[] | null) ?? [],
    notifications:
      (notifications.data as Record<string, unknown>[] | null) ?? [],
  };
}
