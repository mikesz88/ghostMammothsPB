import Link from "next/link";

import { Label } from "@/components/ui/label";

export function LoginPasswordLabelRow() {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor="password">Password</Label>
      <Link
        href="/forgot-password"
        className="text-sm text-primary hover:underline"
      >
        Forgot password?
      </Link>
    </div>
  );
}
