import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'node:crypto';

interface SupabaseAuthWebhookPayload {
  type: string;
  table: string;
  schema: string;
  record: {
    id: string;
    email: string;
    raw_user_meta_data: Record<string, unknown>;
  };
}

/**
 * Validiert den Webhook-Secret mittels timing-safe Vergleich.
 */
function isValidWebhookSecret(request: Request): boolean {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return false;
  }

  // Supabase sendet den Secret als Bearer-Token
  const token = authHeader.replace('Bearer ', '');

  try {
    const secretBuffer = Buffer.from(secret, 'utf-8');
    const tokenBuffer = Buffer.from(token, 'utf-8');

    if (secretBuffer.length !== tokenBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(secretBuffer, tokenBuffer);
  } catch {
    return false;
  }
}

/**
 * Erstellt Profil und Standard-Einstellungen für neue Nutzer.
 */
async function handleUserCreated(record: SupabaseAuthWebhookPayload['record']) {
  // Use untyped client until Database types are generated via `supabase gen types typescript`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const displayName =
    typeof record.raw_user_meta_data?.display_name === 'string' &&
    record.raw_user_meta_data.display_name.length > 0
      ? record.raw_user_meta_data.display_name
      : record.email.split('@')[0];

  // Profil anlegen
  const { error: profileError } = await supabase.from('profiles').insert({
    id: record.id,
    display_name: displayName,
    wahlkreis_id: null,
    bio: null,
    avatar_url: null,
    verification_tier: 'unverified',
    reputation_points: 0,
    privilege_tier: 0,
    is_public: false,
  });

  if (profileError) {
    throw new Error(`Profil konnte nicht erstellt werden: ${(profileError as Error).message}`);
  }

  // Standard-Einstellungen anlegen
  const { error: prefsError } = await supabase.from('user_preferences').insert({
    user_id: record.id,
    categories: [],
    notification_votes: true,
    notification_comments: true,
    notification_results: true,
    theme: 'system',
    language: 'de',
    daily_goal: 5,
    font_size: 'medium',
    high_contrast: false,
    reduced_motion: false,
    art9_consent_at: null,
    onboarding_completed: false,
  });

  if (prefsError) {
    throw new Error(`Einstellungen konnten nicht erstellt werden: ${(prefsError as Error).message}`);
  }
}

export async function POST(request: Request) {
  // Webhook-Secret prüfen
  if (!isValidWebhookSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const payload = (await request.json()) as SupabaseAuthWebhookPayload;

    // Nur INSERT-Events in der auth.users-Tabelle verarbeiten
    if (
      payload.type === 'INSERT' &&
      payload.table === 'users' &&
      payload.schema === 'auth'
    ) {
      await handleUserCreated(payload.record);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Interner Serverfehler';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
