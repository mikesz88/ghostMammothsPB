import { SettingsMembershipCancelPendingAlert } from "@/components/settings/membership/settings-membership-cancel-pending-alert";
import { SettingsMembershipRenewalDateRow } from "@/components/settings/membership/settings-membership-renewal-date-row";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export function SettingsMembershipRenewalBlock({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  if (!membership.isPaid) return null;
  return (
    <>
      <SettingsMembershipRenewalDateRow membership={membership} />
      <SettingsMembershipCancelPendingAlert membership={membership} />
    </>
  );
}
