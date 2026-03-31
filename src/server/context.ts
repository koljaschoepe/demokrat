import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/auth/types';

export async function createContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data as Profile | null;
  }

  return {
    supabase,
    user: user as User | null,
    profile,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
