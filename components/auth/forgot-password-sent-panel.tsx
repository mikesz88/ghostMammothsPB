import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ForgotPasswordSentPanel() {
  return (
    <div className="space-y-4">
      <div className="p-3 text-sm text-green-700 bg-green-50 dark:text-green-200 dark:bg-green-950 rounded-md">
        If an account exists for that address, you&apos;ll receive an email
        with a reset link shortly. Check your spam folder if you don&apos;t see
        it.
      </div>
      <Button variant="outline" className="w-full" asChild>
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
