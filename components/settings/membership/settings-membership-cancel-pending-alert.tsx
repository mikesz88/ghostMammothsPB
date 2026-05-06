import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export function SettingsMembershipCancelPendingAlert({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  if (!membership.cancelAtPeriodEnd || !membership.currentPeriodEnd) {
    return null;
  }
  return (
    <Alert>
      <AlertCircle className="w-4 h-4" />
      <AlertDescription>
        Your membership will cancel on{" "}
        {membership.currentPeriodEnd.toLocaleDateString()}. You&apos;ll still
        have access until then.
      </AlertDescription>
    </Alert>
  );
}
