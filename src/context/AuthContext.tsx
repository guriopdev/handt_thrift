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
  updateProfile: (data: Partial<User>) => void;
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

  const handleUserSession = (supabaseUser: any) => {
    // 1. Core user from Supabase
    const baseUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
    };

    // 2. Hydrate local profile state (Since we don't have a Postgres tables migrations yet, we combine local DB mapping)
    // NOTE: For real production, this would do: supabase.from('users').select('*').eq('id', user.id)
    const storedLocalProfile = localStorage.getItem(`profile_${baseUser.id}`);
    
    if (storedLocalProfile) {
      setUser({ ...baseUser, ...JSON.parse(storedLocalProfile) });
    } else {
      // Create fresh profile with info extracted from Google if available
      const newProfile = {
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || "",
        number: "",
        location: ""
      };
      
      setUser({ ...baseUser, ...newProfile });
      
      // If we are on the callback page, wait a frame, but mostly we let Browse route push them to dashboard if name missing
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

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    
    // Save to browser for this specific DB user ID
    localStorage.setItem(`profile_${user.id}`, JSON.stringify({
      name: updated.name,
      number: updated.number,
      location: updated.location
    }));

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
