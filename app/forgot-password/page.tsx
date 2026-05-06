import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgotPasswordPageClient } from "@/components/auth/forgot-password-page-client";

export default async function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <ForgotPasswordPageClient />
    </AuthPageShell>
  );
}
