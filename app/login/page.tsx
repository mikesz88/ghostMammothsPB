import { LoginPageClient } from "@/components/auth/login/login-page-client";
import { AuthPageShell } from "@/components/auth/shared/auth-page-shell";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  return (
    <AuthPageShell>
      <LoginPageClient initialMessage={message ?? null} />
    </AuthPageShell>
  );
}
