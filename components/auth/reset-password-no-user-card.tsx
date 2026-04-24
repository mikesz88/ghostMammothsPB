import Link from "next/link";

import { AuthRouteContentCenter } from "@/components/auth/auth-route-content-center";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ResetPasswordNoUserCard() {
  return (
    <AuthRouteContentCenter>
      <h1 className="sr-only">Set new password</h1>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Link required</CardTitle>
          <CardDescription>
            Open the reset link from your email, or request a new one below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/forgot-password">Request reset link</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthRouteContentCenter>
  );
}
