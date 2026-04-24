"use client";

import { AuthRouteContentCenter } from "@/components/auth/auth-route-content-center";
import { SignupRegistrationFooter } from "@/components/auth/signup-registration-footer";
import { SignupRegistrationFormFields } from "@/components/auth/signup-registration-form-fields";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSignupRegistrationForm } from "@/lib/hooks/use-signup-registration-form";

import type { AuthContextType } from "@/lib/auth-context";

type Props = {
  signUp: AuthContextType["signUp"];
  onSuccess: () => void;
};

export function SignupRegistrationForm({ signUp, onSuccess }: Props) {
  const f = useSignupRegistrationForm(signUp, onSuccess);
  return (
    <AuthRouteContentCenter>
      <h1 className="sr-only">Sign up</h1>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Create Account</CardTitle>
          <CardDescription>
            Join the Ghost Mammoth pickleball community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupRegistrationFormFields f={f} />
          <SignupRegistrationFooter />
        </CardContent>
      </Card>
    </AuthRouteContentCenter>
  );
}
