"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const supabase = createClient();

  // Listen to Supabase Auth State Changes
  useEffect(() => {
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
  }, []);

  const handleUserSession = async (supabaseUser: any) => {
    // 1. Core user from Supabase
    const baseUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
    };

    // 2. Fetch authenticated profile directly from Postgres
    const { data: dbProfile } = await supabase.from('profiles').select('*').eq('id', baseUser.id).single();
    
    if (dbProfile) {
      setUser({ ...baseUser, ...dbProfile });
    } else {
      // 3. Draft fresh profile structure if not yet initialized in database
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
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    router.push("/");
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    
    // Save to authentic Postgres DB securely using Row Level Security overrides gracefully
    await supabase.from('profiles').upsert({
      id: user.id,
      name: updated.name,
      number: updated.number,
      location: updated.location,
    });
    
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
