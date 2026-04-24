import { MembershipMarketingValueStatCards } from "@/components/membership/membership-marketing-value-stat-cards";

import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  monthlyTier: MembershipTierRow | undefined;
};

export function MembershipMarketingValueSection({ monthlyTier }: Props) {
  if (!monthlyTier) return null;
  return (
    <div className="max-w-3xl mx-auto mt-16 text-center">
      <h2 className="text-2xl font-bold text-foreground mb-4">Why Go Monthly?</h2>
      <p className="text-muted-foreground mb-8">
        If you play more than 3 events per month, the monthly membership pays for
        itself!
      </p>
      <MembershipMarketingValueStatCards monthlyTier={monthlyTier} />
    </div>
  );
}
