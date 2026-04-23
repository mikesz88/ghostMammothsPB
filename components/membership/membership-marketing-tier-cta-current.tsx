import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  isPaidTier: boolean;
};

export function MembershipMarketingTierCtaCurrent({ isPaidTier }: Props) {
  return (
    <Button
      variant="outline"
      className="w-full"
      size="lg"
      disabled={!isPaidTier}
      asChild={isPaidTier}
    >
      {isPaidTier ? (
        <Link href="/settings/membership">Manage Membership</Link>
      ) : (
        <span>Current Plan</span>
      )}
    </Button>
  );
}
