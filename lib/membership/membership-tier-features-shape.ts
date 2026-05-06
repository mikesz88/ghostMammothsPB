import type { MembershipTierRow } from "@/lib/membership/membership-tier-row";

export type MembershipTierFeaturesShape = {
  event_access?: string;
  priority_queue?: boolean;
  exclusive_events?: boolean;
  merchandise_discount?: number;
};

export function tierFeaturesFromRow(
  raw: MembershipTierRow["features"],
): MembershipTierFeaturesShape {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as MembershipTierFeaturesShape;
  }
  return {};
}
