import { MembershipMarketingTierCtaCurrent } from "@/components/membership/membership-marketing-tier-cta-current";
import { MembershipMarketingTierCtaDowngrade } from "@/components/membership/membership-marketing-tier-cta-downgrade";
import { MembershipMarketingTierCtaUpgrade } from "@/components/membership/membership-marketing-tier-cta-upgrade";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
  isCurrent: boolean;
  isPaidTier: boolean;
};

export function MembershipMarketingTierCta({
  tier,
  isCurrent,
  isPaidTier,
}: Props) {
  if (isCurrent) {
    return <MembershipMarketingTierCtaCurrent isPaidTier={isPaidTier} />;
  }
  if (isPaidTier) {
    return (
      <MembershipMarketingTierCtaUpgrade
        tierId={tier.id}
        displayName={tier.display_name}
      />
    );
  }
  return (
    <MembershipMarketingTierCtaDowngrade displayName={tier.display_name} />
  );
}
