import { Shield } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SettingsHubQuickActionAdmin() {
  return (
    <Button variant="outline" className="w-full justify-start" asChild>
      <Link href="/admin">
        <Shield className="w-4 h-4 mr-2" />
        Admin Dashboard
      </Link>
    </Button>
  );
}
