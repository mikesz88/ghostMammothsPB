import { Crown } from "lucide-react";

export function MembershipMarketingTierFeatureExclusive() {
  return (
    <li className="flex items-start gap-2">
      <Crown className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <span className="text-muted-foreground">Access to exclusive events</span>
    </li>
  );
}
