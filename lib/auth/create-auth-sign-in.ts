"use client";

import { postEnsureUserProfile } from "@/lib/auth/ensure-user-profile-request";

import type { AuthFlowError } from "@/lib/auth/auth-flow-types";
import type { SupabaseClient, User } from "@supabase/supabase-js";

async function ensureProfileRowExists(
  supabase: SupabaseClient,
  user: User,
) {
  const { data: existingProfile } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();
  if (existingProfile) {
    return;
  }
  await postEnsureUserProfile({
    name: user.user_metadata?.name,
    skill_level: user.user_metadata?.skill_level,
    phone: user.user_metadata?.phone,
  });
}

export function createAuthSignIn(supabase: SupabaseClient) {
  return async (
    email: string,
    password: string,
  ): Promise<{ error: AuthFlowError }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (data.user && !error) {
      await ensureProfileRowExists(supabase, data.user);
    }
    return { error };
  };
}
