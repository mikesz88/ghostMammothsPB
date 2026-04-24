import type { SupabaseClient } from "@supabase/supabase-js";

export type SignUpUserData = {
  name: string;
  skillLevel: string;
  phone?: string;
};

export type SignUpWithRedirectParams = {
  supabase: SupabaseClient;
  email: string;
  password: string;
  userData: SignUpUserData;
  redirectTo: string;
};

export function signUpWithEmailRedirect({
  supabase,
  email,
  password,
  userData,
  redirectTo,
}: SignUpWithRedirectParams) {
  return supabase.auth.signUp({
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
}
