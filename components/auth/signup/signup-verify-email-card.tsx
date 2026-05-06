import { AuthRouteContentCenter } from "@/components/auth/shared/auth-route-content-center";
import { SignupVerifyEmailBody } from "@/components/auth/signup/signup-verify-email-body";
import { Card } from "@/components/ui/card";

export function SignupVerifyEmailCard() {
  return (
    <AuthRouteContentCenter>
      <h1 className="sr-only">Verify your email</h1>
      <Card className="border-border bg-card">
        <SignupVerifyEmailBody />
      </Card>
    </AuthRouteContentCenter>
  );
}

