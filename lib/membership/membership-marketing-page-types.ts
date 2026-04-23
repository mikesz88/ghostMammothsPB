import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";
import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";

export type MembershipMarketingPageClientProps = {
  tiers: MembershipTierRow[];
  membership: UserMembershipInfo;
  tiersErrorMessage: string | null;
};
