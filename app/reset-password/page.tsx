import { ResetPasswordPageClient } from "@/components/auth/reset-password/reset-password-page-client";
import { AuthPageShell } from "@/components/auth/shared/auth-page-shell";

export default async function ResetPasswordPage() {
  return (
    <AuthPageShell>
      <ResetPasswordPageClient />
    </AuthPageShell>
  );
}
