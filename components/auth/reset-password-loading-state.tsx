import { AuthRouteContentCenter } from "@/components/auth/auth-route-content-center";

export function ResetPasswordLoadingState() {
  return (
    <AuthRouteContentCenter>
      <h1 className="sr-only">Set new password</h1>
      <div className="text-muted-foreground">Loading...</div>
    </AuthRouteContentCenter>
  );
}
