import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SettingsHubMembershipManageButton() {
  return (
    <Button variant="outline" asChild>
      <Link href="/settings/membership">
        Manage Membership
        <ChevronRight className="w-4 h-4 ml-1" />
      </Link>
    </Button>
  );
}
