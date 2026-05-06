import type { AuthFlowError } from "@/lib/auth/auth-flow-types";
import type { AuthError, Session, User } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthFlowError }>;
  signUp: (
    email: string,
    password: string,
    userData: { name: string; skillLevel: string; phone?: string },
  ) => Promise<{ error: AuthFlowError }>;
  signOut: () => Promise<void>;
  resendVerificationEmail: (
    email: string,
  ) => Promise<{ error: AuthError | null }>;
  resetPasswordForEmail: (
    email: string,
  ) => Promise<{ error: AuthFlowError }>;
  updatePassword: (
    newPassword: string,
  ) => Promise<{ error: AuthError | null }>;
}
