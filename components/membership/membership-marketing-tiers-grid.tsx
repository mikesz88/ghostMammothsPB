import { MembershipMarketingTierCard } from "@/components/membership/membership-marketing-tier-card";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";
import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

type Props = {
  tiers: MembershipTierRow[];
  membership: UserMembershipInfo;
};

export function MembershipMarketingTiersGrid({ tiers, membership }: Props) {
  const currentTierName = membership.tierName || "free";
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {tiers.map((tier) => (
        <MembershipMarketingTierCard
          key={tier.id}
          tier={tier}
          isCurrent={currentTierName === tier.name}
        />
      ))}
    </div>
  );
}
