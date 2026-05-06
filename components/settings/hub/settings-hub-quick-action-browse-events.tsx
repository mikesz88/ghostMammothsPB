import { Calendar } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SettingsHubQuickActionBrowseEvents() {
  return (
    <Button variant="outline" className="w-full justify-start" asChild>
      <Link href="/events">
        <Calendar className="w-4 h-4 mr-2" />
        Browse Events
      </Link>
    </Button>
  );
}
