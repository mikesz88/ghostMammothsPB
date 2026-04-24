import { Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function MembershipMarketingTierCurrentBadge() {
  return (
    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
      <Badge className="bg-primary text-primary-foreground">
        <Crown className="w-3 h-3 mr-1" />
        Current Plan
      </Badge>
    </div>
  );
}
