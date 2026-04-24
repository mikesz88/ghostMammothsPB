import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export function SettingsHubMembershipRenewalNote({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  if (!membership.isPaid || !membership.currentPeriodEnd) return null;
  const label = membership.cancelAtPeriodEnd ? "Cancels on" : "Renews on";
  const date = membership.currentPeriodEnd.toLocaleDateString();
  return (
    <p className="text-sm text-muted-foreground mt-1">
      {label} {date}
    </p>
  );
}
