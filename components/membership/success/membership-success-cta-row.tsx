import Link from "next/link";

import { Button } from "@/components/ui/button";

export function MembershipSuccessCtaRow() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" asChild>
        <Link href="/events">Browse Events</Link>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <Link href="/settings/membership">Manage Membership</Link>
      </Button>
    </div>
  );
}
