import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginPageClient } from "@/components/auth/login-page-client";

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
