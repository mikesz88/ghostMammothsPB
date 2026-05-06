import { formatPrice } from "@/lib/membership-helpers";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
  isPaidTier: boolean;
};

export function MembershipMarketingTierPriceBlock({
  tier,
  isPaidTier,
}: Props) {
  const period =
    tier.billing_period === "free" ? "forever" : tier.billing_period;
  return (
    <div>
      <p className="text-4xl font-bold text-foreground">
        {formatPrice(tier.price)}
        <span className="text-lg font-normal text-muted-foreground">
          /{period}
        </span>
      </p>
      {isPaidTier && tier.billing_period === "monthly" ? (
        <p className="text-sm text-muted-foreground mt-1">Cancel anytime</p>
      ) : null}
    </div>
  );
}
