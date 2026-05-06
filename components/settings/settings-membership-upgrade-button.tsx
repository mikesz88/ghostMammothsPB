import { Crown } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SettingsMembershipUpgradeButton() {
  return (
    <div className="flex gap-3 pt-4">
      <Button className="w-full" asChild>
        <Link href="/membership">
          <Crown className="w-4 h-4 mr-2" />
          Upgrade Membership
        </Link>
      </Button>
    </div>
  );
}
