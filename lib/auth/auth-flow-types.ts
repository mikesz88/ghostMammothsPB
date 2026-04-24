import type { AuthError } from "@supabase/supabase-js";

/** Supabase `AuthError` or app-thrown `Error` (e.g. missing config). */
export type AuthFlowError = AuthError | Error | null;

/** Result of post-`signUp` handling (profile row, unconfirmed email, etc.). */
export type PostSignUpResult = AuthFlowError | "unconfirmed-ok" | "noop";
