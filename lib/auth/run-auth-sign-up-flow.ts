"use client";

import { getAppBaseUrlOrNull } from "@/lib/auth/get-app-base-url";
import { handleSignUpAfterUserCreated } from "@/lib/auth/handle-sign-up-after-user-created";
import { resolveSignUpPostResult } from "@/lib/auth/resolve-sign-up-post-result";
import { signUpWithEmailRedirect } from "@/lib/auth/sign-up-with-email-redirect";

import type { AuthFlowError } from "@/lib/auth/auth-flow-types";
import type { SupabaseClient } from "@supabase/supabase-js";

function missingBaseUrlFlowError(): { error: AuthFlowError } {
  console.error("Unable to determine base URL for email redirect");
  return {
    error: new Error(
      "Configuration error: Unable to determine application URL",
    ),
  };
}

export async function runAuthSignUpFlow(
  supabase: SupabaseClient,
  email: string,
  password: string,
  userData: { name: string; skillLevel: string; phone?: string },
): Promise<{ error: AuthFlowError }> {
  const baseUrl = getAppBaseUrlOrNull();
  if (!baseUrl) {
    return missingBaseUrlFlowError();
  }
  const { data, error } = await signUpWithEmailRedirect({
    supabase,
    email,
    password,
    userData,
    redirectTo: `${baseUrl}/auth/callback`,
  });
  const post = await handleSignUpAfterUserCreated(
    supabase,
    data,
    error,
    userData,
  );
  return resolveSignUpPostResult(post, error);
}
