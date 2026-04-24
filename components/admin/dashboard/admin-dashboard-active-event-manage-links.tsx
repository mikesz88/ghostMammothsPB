import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { Event } from "@/lib/types";

export function AdminDashboardActiveEventManageLinks({ event }: { event: Event }) {
  return (
    <div className="flex gap-2">
      <Button variant="default" className="flex-1" asChild>
        <Link href={`/admin/events/${event.id}`}>
          Manage Event
          <ExternalLink className="w-4 h-4 ml-2" />
        </Link>
      </Button>
      <Button variant="outline" className="flex-1 bg-transparent" asChild>
        <Link href={`/events/${event.id}`}>View Public</Link>
      </Button>
    </div>
  );
}
