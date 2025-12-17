"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    userData: { name: string; skillLevel: string; phone?: string }
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If login successful, check if user profile exists and create if missing
    if (data.user && !error) {
      const { data: existingProfile } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingProfile) {
        // Profile doesn't exist, try to create it
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          name: data.user.user_metadata?.name || "User",
          email: email,
          skill_level: data.user.user_metadata?.skill_level || "intermediate",
          phone: data.user.user_metadata?.phone || null,
          is_admin: false,
        });

        if (profileError) {
          console.warn(
            "Could not create user profile during login:",
            profileError
          );
          // Don't fail the login, just log the warning
        }
      }
    }

    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    userData: { name: string; skillLevel: string; phone?: string }
  ) => {
    // Get the base URL - prioritize NEXT_PUBLIC_URL, otherwise use current origin
    const baseUrl =
      process.env.NEXT_PUBLIC_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const redirectTo = baseUrl ? `${baseUrl}/login` : "/login";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          name: userData.name,
          skill_level: userData.skillLevel,
          phone: userData.phone,
        },
      },
    });

    // If signup successful but email confirmation is required
    if (data.user && !error) {
      // Check if email confirmation is required
      if (data.user.identities && data.user.identities.length === 0) {
        // User already exists
        return {
          error: new Error(
            "An account with this email already exists. Please log in instead."
          ),
        };
      }

      // Check if email is confirmed
      const emailConfirmed =
        data.user.email_confirmed_at || data.user.confirmed_at;

      // If user needs to confirm email, sign them out and show message
      if (!emailConfirmed) {
        console.log(
          "Email confirmation required - profile will be created upon first login"
        );
        // Sign out any session that might have been created
        await supabase.auth.signOut();
        return { error: null }; // Success, but awaiting email confirmation
      }

      // If we have a confirmed email (email confirmation disabled or already confirmed), create profile now
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        name: userData.name,
        email: email,
        skill_level: userData.skillLevel,
        phone: userData.phone || null,
        is_admin: false,
      });

      if (profileError) {
        console.error("Error creating user profile:", profileError);

        // Don't fail signup if profile creation fails - it will be created on login
        if (profileError.message.includes("row-level security")) {
          console.log("Profile will be created on first login");
        }
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
