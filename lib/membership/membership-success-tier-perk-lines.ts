import { Crown, Gift, Shield, Zap } from "lucide-react";

import type { MembershipTierFeaturesShape } from "@/lib/membership/membership-tier-features-shape";
import type { LucideIcon } from "lucide-react";

export type MembershipSuccessTierPerkLine = {
  icon: LucideIcon;
  label: string;
};

export function membershipSuccessTierPerkLines(
  f: MembershipTierFeaturesShape,
): MembershipSuccessTierPerkLine[] {
  const out: MembershipSuccessTierPerkLine[] = [];
  if (f.event_access === "unlimited") {
    out.push({ icon: Zap, label: "Free entry to ALL events" });
  }
  if (f.priority_queue) {
    out.push({ icon: Shield, label: "Priority queue position" });
  }
  if (f.exclusive_events) {
    out.push({ icon: Crown, label: "Exclusive events access" });
  }
  if (f.merchandise_discount) {
    out.push({
      icon: Gift,
      label: `${f.merchandise_discount}% merchandise discount`,
    });
  }
  return out;
}
