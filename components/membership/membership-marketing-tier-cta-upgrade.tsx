import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  tierId: string;
  displayName: string;
};

export function MembershipMarketingTierCtaUpgrade({
  tierId,
  displayName,
}: Props) {
  return (
    <Button className="w-full" size="lg" asChild>
      <Link href={`/membership/checkout?tier=${tierId}`}>
        Upgrade to {displayName}
      </Link>
    </Button>
  );
}
