import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupPageClient } from "@/components/auth/signup-page-client";

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
