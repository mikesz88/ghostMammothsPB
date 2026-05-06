import { EventDetailStatTileIcon } from "@/components/events/event-detail-stat-tile-icon";
import { EventDetailStatTileText } from "@/components/events/event-detail-stat-tile-text";

import type { LucideIcon } from "lucide-react";

export function EventDetailStatTileBody({
  icon,
  iconBgClass,
  iconClass,
  value,
  label,
}: {
  icon: LucideIcon;
  iconBgClass: string;
  iconClass: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <EventDetailStatTileIcon
        icon={icon}
        iconBgClass={iconBgClass}
        iconClass={iconClass}
      />
      <EventDetailStatTileText value={value} label={label} />
    </div>
  );
}
