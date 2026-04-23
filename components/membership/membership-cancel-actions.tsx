import Link from "next/link";

import { Button } from "@/components/ui/button";

export function MembershipCancelActions() {
  return (
    <div className="flex flex-col gap-3">
      <Button asChild>
        <Link href="/membership">View Membership Plans</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/events">Browse Events</Link>
      </Button>
    </div>
  );
}
