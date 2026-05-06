import { EventDetailStatTileBody } from "@/components/events/event-detail-stat-tile-body";
import { Card, CardContent } from "@/components/ui/card";

import type { LucideIcon } from "lucide-react";

type EventDetailStatTileProps = {
  icon: LucideIcon;
  iconBgClass: string;
  iconClass: string;
  value: string | number;
  label: string;
};

export function EventDetailStatTile(p: EventDetailStatTileProps) {
  return (
    <Card className="border-border bg-background">
      <CardContent className="p-4">
        <EventDetailStatTileBody {...p} />
      </CardContent>
    </Card>
  );
}
