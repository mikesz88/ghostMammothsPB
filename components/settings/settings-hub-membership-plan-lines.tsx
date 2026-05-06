import { SettingsHubMembershipRenewalNote } from "@/components/settings/settings-hub-membership-renewal-note";
import { SettingsHubMembershipTierPriceLine } from "@/components/settings/settings-hub-membership-tier-price-line";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export function SettingsHubMembershipPlanLines({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  return (
    <div>
      <p className="text-muted-foreground text-sm mb-1">Current Plan</p>
      <p className="font-medium text-foreground">
        <SettingsHubMembershipTierPriceLine membership={membership} />
      </p>
      <SettingsHubMembershipRenewalNote membership={membership} />
    </div>
  );
}
