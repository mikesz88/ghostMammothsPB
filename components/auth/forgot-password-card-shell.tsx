import { AuthRouteContentCenter } from "@/components/auth/auth-route-content-center";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function ForgotPasswordCardShell({ children }: Props) {
  return (
    <AuthRouteContentCenter>
      <h1 className="sr-only">Reset password</h1>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Forgot password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to choose a new
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </AuthRouteContentCenter>
  );
}
