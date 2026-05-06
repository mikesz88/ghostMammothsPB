import { Shield } from "lucide-react";

export function MembershipMarketingTierFeaturePriority() {
  return (
    <li className="flex items-start gap-2">
      <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <span className="text-muted-foreground">Priority queue position</span>
    </li>
  );
}
