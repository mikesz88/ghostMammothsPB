import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

type Props = {
  tier: MembershipTierRow;
};

export function MembershipCheckoutPageHeader({ tier }: Props) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Upgrade to {tier.display_name}
      </h1>
      <p className="text-muted-foreground">
        {tier.description || "Get unlimited access to all events"}
      </p>
    </div>
  );
}
