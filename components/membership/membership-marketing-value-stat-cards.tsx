import { MembershipMarketingValueStatCard } from "@/components/membership/membership-marketing-value-stat-card";
import { formatPrice } from "@/lib/membership-helpers";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  monthlyTier: MembershipTierRow;
};

export function MembershipMarketingValueStatCards({
  monthlyTier,
}: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <MembershipMarketingValueStatCard
        title="Unlimited"
        subtitle="Events per month"
      />
      <MembershipMarketingValueStatCard
        title={formatPrice(monthlyTier.price)}
        subtitle="Fixed monthly cost"
      />
      <MembershipMarketingValueStatCard
        title="Save"
        subtitle="vs. paying per event"
      />
    </div>
  );
}
