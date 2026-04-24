import { MembershipMarketingTierCardContent } from "@/components/membership/membership-marketing-tier-card-content";
import { MembershipMarketingTierCurrentBadge } from "@/components/membership/membership-marketing-tier-current-badge";
import { MembershipMarketingTierTitleRow } from "@/components/membership/membership-marketing-tier-title-row";
import { Card, CardHeader } from "@/components/ui/card";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
  isCurrent: boolean;
};

export function MembershipMarketingTierCard({ tier, isCurrent }: Props) {
  const isPaidTier = tier.price > 0;
  return (
    <Card
      className={`border-2 ${
        isCurrent ? "border-primary bg-primary/5" : "border-border"
      } relative`}
    >
      {isCurrent && isPaidTier ? <MembershipMarketingTierCurrentBadge /> : null}
      <CardHeader>
        <MembershipMarketingTierTitleRow
          tier={tier}
          isCurrent={isCurrent}
          isPaidTier={isPaidTier}
        />
      </CardHeader>
      <MembershipMarketingTierCardContent
        tier={tier}
        isCurrent={isCurrent}
        isPaidTier={isPaidTier}
      />
    </Card>
  );
}
