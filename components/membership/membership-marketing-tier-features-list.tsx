import { MembershipMarketingTierFeatureCommunity } from "@/components/membership/membership-marketing-tier-feature-community";
import { MembershipMarketingTierFeatureEmail } from "@/components/membership/membership-marketing-tier-feature-email";
import { MembershipMarketingTierFeatureExclusive } from "@/components/membership/membership-marketing-tier-feature-exclusive";
import { MembershipMarketingTierFeatureFreeBaseline } from "@/components/membership/membership-marketing-tier-feature-free-baseline";
import { MembershipMarketingTierFeatureMerch } from "@/components/membership/membership-marketing-tier-feature-merch";
import { MembershipMarketingTierFeaturePayPerEvent } from "@/components/membership/membership-marketing-tier-feature-pay-per-event";
import { MembershipMarketingTierFeaturePriority } from "@/components/membership/membership-marketing-tier-feature-priority";
import { MembershipMarketingTierFeatureUnlimited } from "@/components/membership/membership-marketing-tier-feature-unlimited";
import { tierFeaturesFromRow } from "@/lib/membership/membership-tier-features-shape";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
  isPaidTier: boolean;
};

export function MembershipMarketingTierFeaturesList({
  tier,
  isPaidTier,
}: Props) {
  const f = tierFeaturesFromRow(tier.features);
  return (
    <ul className="space-y-3">
      <MembershipMarketingTierFeatureUnlimited eventAccess={f.event_access} />
      <MembershipMarketingTierFeaturePayPerEvent eventAccess={f.event_access} />
      {f.priority_queue ? <MembershipMarketingTierFeaturePriority /> : null}
      {f.exclusive_events ? <MembershipMarketingTierFeatureExclusive /> : null}
      {f.merchandise_discount ? (
        <MembershipMarketingTierFeatureMerch
          discountPct={f.merchandise_discount}
        />
      ) : null}
      <MembershipMarketingTierFeatureFreeBaseline isPaidTier={isPaidTier} />
      <MembershipMarketingTierFeatureEmail />
      <MembershipMarketingTierFeatureCommunity isPaidTier={isPaidTier} />
    </ul>
  );
}
