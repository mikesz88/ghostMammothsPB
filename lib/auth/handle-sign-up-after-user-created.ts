"use client";

import { postEnsureUserProfile } from "@/lib/auth/ensure-user-profile-request";

import type { AuthFlowError, PostSignUpResult } from "@/lib/auth/auth-flow-types";
import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";

type UserData = {
  name: string;
  skillLevel: string;
  phone?: string;
};

function duplicateEmailIdentityError(user: User): AuthFlowError {
  if (user.identities?.length !== 0) {
    return null;
  }
  return new Error(
    "An account with this email already exists. Please log in instead.",
  );
}

export async function handleSignUpAfterUserCreated(
  supabase: SupabaseClient,
  data: { user: User | null },
  signUpError: AuthError | null,
  userData: UserData,
): Promise<PostSignUpResult> {
  if (!data.user || signUpError) return "noop";
  const dupErr = duplicateEmailIdentityError(data.user);
  if (dupErr) return dupErr;
  const emailConfirmed =
    data.user.email_confirmed_at || data.user.confirmed_at;
  if (!emailConfirmed) {
    await supabase.auth.signOut();
    return "unconfirmed-ok";
  }
  await postEnsureUserProfile({
    name: userData.name,
    skill_level: userData.skillLevel,
    phone: userData.phone,
  });
  return "noop";
}
