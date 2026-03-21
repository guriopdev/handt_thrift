"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export interface User {
  id: string;
  email?: string;
  name?: string;
  number?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  loginWithGoogle: () => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Lazily create the Supabase client — only runs in the browser after mount.
  // This prevents the client from being instantiated during Next.js SSR/prerendering
  // when environment variables may not be available (e.g. on Vercel build).
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  // Listen to Supabase Auth State Changes — only runs on the client
  useEffect(() => {
    const supabase = getSupabase();

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleUserSession(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleUserSession(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserSession = async (supabaseUser: any) => {
    const supabase = getSupabase();
    const baseUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
    };

    // Fetch profile from Postgres
    const { data: dbProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', baseUser.id)
      .single();

    if (dbProfile) {
      setUser({ ...baseUser, ...dbProfile });
    } else {
      const newProfile = {
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || "",
        number: "",
        location: ""
      };
      setUser({ ...baseUser, ...newProfile });
    }
    setLoading(false);
  };

  const loginWithGoogle = async () => {
    const supabase = getSupabase();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  const logout = async () => {
    const supabase = getSupabase();
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    router.push("/");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const supabase = getSupabase();
    const updated = { ...user, ...data };

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: updated.name,
      number: updated.number,
      location: updated.location,
    }, { onConflict: 'id' });

    if (error) {
      console.error('Profile save error:', error);
      // Still update local state so UI doesn't break
    }

    setUser(updated);
    router.push("/dashboard");
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
