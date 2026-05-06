import { Check } from "lucide-react";

import { MembershipCheckoutSummaryLine } from "@/components/membership/membership-checkout-summary-line";
import { membershipCheckoutTierPerkLines } from "@/lib/membership/membership-checkout-tier-perk-lines";
import { tierFeaturesFromRow } from "@/lib/membership/membership-tier-features-shape";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
};

export function MembershipCheckoutSummaryFeatures({ tier }: Props) {
  const f = tierFeaturesFromRow(tier.features);
  const perks = membershipCheckoutTierPerkLines(f);
  return (
    <div className="space-y-2">
      {perks.map((p) => (
        <MembershipCheckoutSummaryLine key={p.label} icon={p.icon}>
          {p.label}
        </MembershipCheckoutSummaryLine>
      ))}
      <MembershipCheckoutSummaryLine icon={Check}>
        Email notifications
      </MembershipCheckoutSummaryLine>
      <MembershipCheckoutSummaryLine icon={Check}>
        Support local pickleball community
      </MembershipCheckoutSummaryLine>
    </div>
  );
}
