import { ForgotPasswordPageClient } from "@/components/auth/forgot-password/forgot-password-page-client";
import { AuthPageShell } from "@/components/auth/shared/auth-page-shell";

export default async function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <ForgotPasswordPageClient />
    </AuthPageShell>
  );
}
