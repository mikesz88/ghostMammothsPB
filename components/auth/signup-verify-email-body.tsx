import Link from "next/link";

import { SignupVerifyEmailMessage } from "@/components/auth/signup-verify-email-message";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

export function SignupVerifyEmailBody() {
  return (
    <CardContent className="p-8 text-center">
      <SignupVerifyEmailMessage />
      <div className="space-y-3">
        <Button variant="ghost" asChild className="w-full">
          <Link href="/login">Return to Login</Link>
        </Button>
      </div>
    </CardContent>
  );
}

