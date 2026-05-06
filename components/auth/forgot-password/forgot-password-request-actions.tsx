import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  loading: boolean;
};

export function ForgotPasswordRequestActions({ loading }: Props) {
  return (
    <>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send reset link"}
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    </>
  );
}
