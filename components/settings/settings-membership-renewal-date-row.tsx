import { Calendar } from "lucide-react";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export function SettingsMembershipRenewalDateRow({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  if (!membership.currentPeriodEnd) return null;
  const end = membership.currentPeriodEnd.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground mb-1">
            {membership.cancelAtPeriodEnd ? "Cancels On" : "Renews On"}
          </p>
          <p className="text-sm text-muted-foreground">{end}</p>
        </div>
      </div>
    </div>
  );
}
