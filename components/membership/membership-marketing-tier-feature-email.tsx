import { Check } from "lucide-react";

export function MembershipMarketingTierFeatureEmail() {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <span className="text-muted-foreground">Email notifications</span>
    </li>
  );
}
