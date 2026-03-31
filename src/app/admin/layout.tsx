import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import type { PrivilegeTier } from '@/lib/auth/types';

/**
 * Phase 165 -- Admin Layout with server-side auth guard.
 *
 * Checks user auth + privilege_tier >= 3 (Moderator).
 * Redirects to home if not authorized.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch profile to check privilege tier
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('display_name, privilege_tier')
    .eq('id', user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileData = profile as any;
  const privilegeTier = (profileData?.privilege_tier ?? 0) as PrivilegeTier;

  if (privilegeTier < 3) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        displayName={profileData?.display_name ?? 'Admin'}
        privilegeTier={privilegeTier}
      />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
