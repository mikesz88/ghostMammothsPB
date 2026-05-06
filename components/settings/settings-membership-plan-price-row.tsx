import { formatPrice } from "@/lib/membership-helpers";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

function billingPeriodLabel(membership: UserMembershipInfo) {
  return membership.tierBillingPeriod === "free"
    ? "forever"
    : membership.tierBillingPeriod;
}

export function SettingsMembershipPlanPriceRow({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div>
        <p className="font-medium text-foreground mb-1">Plan</p>
        <p className="text-sm text-muted-foreground">
          {membership.tierDisplayName}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-foreground">
          {formatPrice(membership.tierPrice)}
        </p>
        <p className="text-sm text-muted-foreground">
          /{billingPeriodLabel(membership)}
        </p>
      </div>
    </div>
  );
}
