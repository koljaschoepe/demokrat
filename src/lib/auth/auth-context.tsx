'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from './types';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider — stellt Auth-State und Profildaten per Context bereit.
 * Muss innerhalb der Supabase-Client-Umgebung gerendert werden.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setProfile((data as Profile | null) ?? null);
    },
    [supabase],
  );

  const clearState = useCallback(() => {
    setUser(null);
    setProfile(null);
  }, []);

  // Initiale Session laden
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (currentUser) {
          setUser(currentUser);
          await fetchProfile(currentUser.id);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [supabase, fetchProfile]);

  // Auth-State-Changes abonnieren
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        clearState();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile, clearState]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, isLoading }),
    [user, profile, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
