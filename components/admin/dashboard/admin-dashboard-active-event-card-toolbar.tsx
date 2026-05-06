import { Edit, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Event } from "@/lib/types";

function AdminDashboardEditEventButton({
  event,
  onEdit,
}: {
  event: Event;
  onEdit: (event: Event) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onEdit(event)}
      aria-label="Edit event"
    >
      <Edit className="w-4 h-4" aria-hidden />
    </Button>
  );
}

function AdminDashboardDeleteEventButton({
  eventId,
  onDelete,
}: {
  eventId: string;
  onDelete: (eventId: string) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onDelete(eventId)}
      aria-label="Delete event"
    >
      <Trash2 className="w-4 h-4" aria-hidden />
    </Button>
  );
}

export function AdminDashboardActiveEventCardToolbar({
  event,
  onEdit,
  onDelete,
}: {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}) {
  return (
    <div className="flex items-start justify-between mb-2">
      <Badge variant="default">Active</Badge>
      <div className="flex items-center gap-2">
        <AdminDashboardEditEventButton event={event} onEdit={onEdit} />
        <AdminDashboardDeleteEventButton
          eventId={event.id}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
