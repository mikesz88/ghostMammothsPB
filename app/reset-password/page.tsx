import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ResetPasswordPageClient } from "@/components/auth/reset-password-page-client";

export default async function ResetPasswordPage() {
  return (
    <AuthPageShell>
      <ResetPasswordPageClient />
    </AuthPageShell>
  );
}
