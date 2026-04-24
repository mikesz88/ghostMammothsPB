import { Calendar, Clock, MapPin, Trophy, Users } from "lucide-react";

import { AdminEventMetaItem } from "@/components/admin/events/admin-event-meta-item";

import type { Event } from "@/lib/types";

function AdminEventHeaderTitleMeta({
  event,
  timeStr,
  modeLabel,
}: {
  event: Event;
  timeStr: string;
  modeLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
      <AdminEventMetaItem icon={MapPin}>{event.location}</AdminEventMetaItem>
      <AdminEventMetaItem icon={Calendar}>
        {event.date.toLocaleDateString()}
      </AdminEventMetaItem>
      <AdminEventMetaItem icon={Clock}>{timeStr}</AdminEventMetaItem>
      <AdminEventMetaItem icon={Users}>{modeLabel}</AdminEventMetaItem>
      <AdminEventMetaItem icon={Trophy}>
        {event.courtCount} Courts
      </AdminEventMetaItem>
    </div>
  );
}

export function AdminEventHeaderTitleBlock({
  event,
  timeStr,
  modeLabel,
}: {
  event: Event;
  timeStr: string;
  modeLabel: string;
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">{event.name}</h1>
      <AdminEventHeaderTitleMeta
        event={event}
        timeStr={timeStr}
        modeLabel={modeLabel}
      />
    </div>
  );
}
