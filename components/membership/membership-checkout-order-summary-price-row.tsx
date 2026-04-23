import { formatPrice } from "@/lib/membership-helpers";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
};

export function MembershipCheckoutOrderSummaryPriceRow({ tier }: Props) {
  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <div>
        <p className="font-medium text-foreground">{tier.display_name}</p>
        <p className="text-sm text-muted-foreground">
          Billed {tier.billing_period} • Cancel anytime
        </p>
      </div>
      <p className="text-2xl font-bold text-foreground">
        {formatPrice(tier.price)}
      </p>
    </div>
  );
}
