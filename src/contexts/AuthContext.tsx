import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  role: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser(userId: string, currentSession?: Session | null) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (data) {
      data.role = data.role ? data.role.toLowerCase().trim() : 'client';
      setUser(data);
    } else if (currentSession?.user) {
      // Fallback if not in public.users table yet
      setUser({
        id: userId,
        email: currentSession.user.email || '',
        name: currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0] || 'User',
        role: currentSession.user.user_metadata?.role || 'client',
        status: 'active',
        created_at: new Date().toISOString()
      });
    } else {
      setUser(null);
    }
  }

  async function refreshUser() {
    if (session?.user?.id) {
      await fetchUser(session.user.id, session);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUser(session.user.id, session).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session?.user) {
        setLoading(true);
        (async () => {
          await fetchUser(session.user.id, session);
          setLoading(false);
        })();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const { error: profileError } = await supabase.from('users').upsert({
        id: data.user.id,
        name,
        email,
        role: 'client',
        status: 'active',
      }, { onConflict: 'id' });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
      
      await supabase.from('seller_profiles').upsert({
        user_id: data.user.id,
        display_name: name,
      }, { onConflict: 'user_id' });
    }
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{
      session, user, loading,
      role: user?.role ?? null,
      signIn, signUp, signOut, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
