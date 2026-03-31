import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Phase 200 -- Production smoke test endpoint.
 * Checks database connectivity, auth service, and environment variables.
 */
export async function GET() {
  const checks: Array<{ name: string; ok: boolean; error?: string }> = [];

  // Check 1: Database connectivity
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;
    const { error } = await supabase.from('profiles').select('id').limit(1);
    checks.push({ name: 'database', ok: !error, error: error?.message });
  } catch (e) {
    checks.push({
      name: 'database',
      ok: false,
      error: e instanceof Error ? e.message : 'Unknown',
    });
  }

  // Check 2: Auth service
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;
    const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });
    checks.push({ name: 'auth', ok: !error, error: error?.message });
  } catch (e) {
    checks.push({
      name: 'auth',
      ok: false,
      error: e instanceof Error ? e.message : 'Unknown',
    });
  }

  // Check 3: Environment variables
  const requiredEnvs = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];
  const missingEnvs = requiredEnvs.filter((e) => !process.env[e]);
  checks.push({
    name: 'env_vars',
    ok: missingEnvs.length === 0,
    error:
      missingEnvs.length > 0
        ? `Missing: ${missingEnvs.join(', ')}`
        : undefined,
  });

  const allOk = checks.every((c) => c.ok);

  return NextResponse.json(
    {
      status: allOk ? 'ready' : 'issues_found',
      checks,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 },
  );
}
