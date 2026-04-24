import { Crown } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SettingsHubQuickActionUpgrade() {
  return (
    <Button variant="default" className="w-full justify-start" asChild>
      <Link href="/membership">
        <Crown className="w-4 h-4 mr-2" />
        Upgrade Membership
      </Link>
    </Button>
  );
}
