'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { type User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    // Listen to Supabase auth state changes (automatically dispatches INITIAL_SESSION on mount)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err: unknown) {
      console.error('[AuthContext] SignOut error:', err);
    }
    setUser(null);
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser ?? null);
    } catch (err: unknown) {
      console.error('[AuthContext] RefreshUser error:', err);
    }
  }, [supabase]);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      signOut,
      refreshUser,
    }),
    [user, loading, signOut, refreshUser]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
