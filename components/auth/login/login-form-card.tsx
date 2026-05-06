"use client";

import { LoginFormFields } from "@/components/auth/login/login-form-fields";
import { LoginSignUpFooter } from "@/components/auth/login/login-sign-up-footer";
import { AuthRouteContentCenter } from "@/components/auth/shared/auth-route-content-center";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLoginForm } from "@/lib/hooks/auth/use-login-form";

import type { AuthContextType } from "@/lib/auth/auth-context";

type Props = {
  initialMessage: string | null;
  signIn: AuthContextType["signIn"];
  resendVerificationEmail: AuthContextType["resendVerificationEmail"];
};

export function LoginFormCard({
  initialMessage,
  signIn,
  resendVerificationEmail,
}: Props) {
  const f = useLoginForm(initialMessage, signIn, resendVerificationEmail);
  return (
    <AuthRouteContentCenter>
      <h1 className="sr-only">Sign in</h1>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to manage your queue and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginFormFields f={f} />
          <LoginSignUpFooter />
        </CardContent>
      </Card>
    </AuthRouteContentCenter>
  );
}
