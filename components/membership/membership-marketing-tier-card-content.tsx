import { MembershipMarketingTierCta } from "@/components/membership/membership-marketing-tier-cta";
import { MembershipMarketingTierFeaturesList } from "@/components/membership/membership-marketing-tier-features-list";
import { MembershipMarketingTierPriceBlock } from "@/components/membership/membership-marketing-tier-price-block";
import { CardContent } from "@/components/ui/card";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
  isCurrent: boolean;
  isPaidTier: boolean;
};

export function MembershipMarketingTierCardContent({
  tier,
  isCurrent,
  isPaidTier,
}: Props) {
  return (
    <CardContent className="space-y-6">
      <MembershipMarketingTierPriceBlock
        tier={tier}
        isPaidTier={isPaidTier}
      />
      <MembershipMarketingTierFeaturesList
        tier={tier}
        isPaidTier={isPaidTier}
      />
      <MembershipMarketingTierCta
        tier={tier}
        isCurrent={isCurrent}
        isPaidTier={isPaidTier}
      />
    </CardContent>
  );
}
