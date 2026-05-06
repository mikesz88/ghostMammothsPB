import { Check } from "lucide-react";

import { formatPrice } from "@/lib/membership-helpers";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
};

export function MembershipSuccessHeadline({ tier }: Props) {
  return (
    <>
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-4">
        Welcome to {tier.display_name}!
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Your subscription is now active at {formatPrice(tier.price)}/
        {tier.billing_period}!
      </p>
    </>
  );
}
