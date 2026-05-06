import { Check } from "lucide-react";

import { membershipSuccessTierPerkLines } from "@/lib/membership/membership-success-tier-perk-lines";
import { tierFeaturesFromRow } from "@/lib/membership/membership-tier-features-shape";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
};

export function MembershipSuccessBenefitsList({ tier }: Props) {
  const f = tierFeaturesFromRow(tier.features);
  const perks = membershipSuccessTierPerkLines(f);
  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {perks.map((p) => {
        const Icon = p.icon;
        return (
          <li key={p.label} className="flex items-center justify-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            {p.label}
          </li>
        );
      })}
      <li className="flex items-center justify-center gap-2">
        <Check className="w-4 h-4 text-primary" />
        Email notifications
      </li>
      <li className="flex items-center justify-center gap-2">
        <Check className="w-4 h-4 text-primary" />
        Support local pickleball community
      </li>
    </ul>
  );
}
