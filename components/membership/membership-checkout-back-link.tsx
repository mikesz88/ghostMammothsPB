import Link from "next/link";

import { Button } from "@/components/ui/button";

export function MembershipCheckoutBackLink() {
  return (
    <div className="text-center mt-6">
      <Button variant="ghost" asChild>
        <Link href="/membership">← Back to Membership Plans</Link>
      </Button>
    </div>
  );
}
