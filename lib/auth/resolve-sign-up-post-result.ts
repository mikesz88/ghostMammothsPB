import type { AuthFlowError, PostSignUpResult } from "@/lib/auth/auth-flow-types";

export function resolveSignUpPostResult(
  post: PostSignUpResult,
  supabaseError: AuthFlowError,
): { error: AuthFlowError } {
  if (post === "unconfirmed-ok") {
    return { error: null };
  }
  if (post !== "noop") {
    return { error: post };
  }
  return { error: supabaseError };
}
