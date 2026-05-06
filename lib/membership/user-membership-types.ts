import type { MembershipStatus } from "@/lib/types-membership";

export interface UserMembershipInfo {
  status: MembershipStatus;
  tierName: string;
  tierDisplayName: string;
  tierPrice: number;
  tierBillingPeriod: string;
  isActive: boolean;
  isPaid: boolean;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}
