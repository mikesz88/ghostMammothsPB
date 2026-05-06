import { AuthPageShell } from "@/components/auth/shared/auth-page-shell";
import { SignupPageClient } from "@/components/auth/signup/signup-page-client";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; flow?: string }>;
}) {
  const { tier, flow } = await searchParams;
  return (
    <AuthPageShell>
      <SignupPageClient tier={tier ?? null} flow={flow ?? null} />
    </AuthPageShell>
  );
}
