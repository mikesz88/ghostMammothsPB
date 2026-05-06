import { SettingsMembershipCancelPendingAlert } from "@/components/settings/settings-membership-cancel-pending-alert";
import { SettingsMembershipRenewalDateRow } from "@/components/settings/settings-membership-renewal-date-row";

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
