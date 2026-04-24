"use client";

import { AuthRouteContentCenter } from "@/components/auth/auth-route-content-center";
import { ResetPasswordFormFields } from "@/components/auth/reset-password-form-fields";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useResetPasswordForm } from "@/lib/hooks/use-reset-password-form";

import type { AuthContextType } from "@/lib/auth-context";

type Props = {
  updatePassword: AuthContextType["updatePassword"];
  signOut: AuthContextType["signOut"];
};

export function ResetPasswordActiveCard({ updatePassword, signOut }: Props) {
  const f = useResetPasswordForm(updatePassword, signOut);
  return (
    <AuthRouteContentCenter>
      <h1 className="sr-only">Set new password</h1>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Set new password</CardTitle>
          <CardDescription>
            Choose a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordFormFields f={f} />
        </CardContent>
      </Card>
    </AuthRouteContentCenter>
  );
}
