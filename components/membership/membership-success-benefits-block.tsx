import { Crown } from "lucide-react";

import { MembershipSuccessBenefitsList } from "@/components/membership/membership-success-benefits-list";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
};

export function MembershipSuccessBenefitsBlock({ tier }: Props) {
  return (
    <div className="bg-primary/5 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Crown className="w-5 h-5 text-primary" />
        <p className="font-semibold text-foreground">
          Your {tier.display_name} Benefits
        </p>
      </div>
      <MembershipSuccessBenefitsList tier={tier} />
    </div>
  );
}
