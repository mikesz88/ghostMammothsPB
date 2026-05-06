import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export function SettingsHubMembershipTierPriceLine({
  membership,
}: {
  membership: UserMembershipInfo;
}) {
  if (!membership.isPaid) {
    return membership.tierDisplayName;
  }
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(membership.tierPrice);
  return `${membership.tierDisplayName} - ${price}/${membership.tierBillingPeriod}`;
}
