import { AdminEventHeaderTitleBlock } from "@/components/admin/events/admin-event-header-title-block";
import { Badge } from "@/components/ui/badge";
import {
  rotationTypeDisplayLabel,
  teamSizeDisplayLabel,
} from "@/lib/events/event-display-labels";

import type { Event } from "@/lib/types";

export function AdminEventHeaderTop({ event }: { event: Event }) {
  const timeStr = event.date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const modeLabel = `${teamSizeDisplayLabel(event.teamSize)} • ${rotationTypeDisplayLabel(event.rotationType)}`;
  return (
    <div className="flex items-start justify-between mb-6">
      <AdminEventHeaderTitleBlock
        event={event}
        timeStr={timeStr}
        modeLabel={modeLabel}
      />
      <Badge variant={event.status === "active" ? "default" : "secondary"}>
        {event.status}
      </Badge>
    </div>
  );
}
