"use client";

import { EditEventDialog } from "@/components/edit-event-dialog";

import type { Event } from "@/lib/types";

export function AdminDashboardEditModal({
  editingEvent,
  setEditingEvent,
  onUpdate,
}: {
  editingEvent: Event;
  setEditingEvent: (e: Event | null) => void;
  onUpdate: (
    event: Omit<Event, "id" | "createdAt" | "updatedAt">,
  ) => void | Promise<void>;
}) {
  return (
    <EditEventDialog
      open
      onOpenChange={(open) => !open && setEditingEvent(null)}
      event={editingEvent}
      onUpdate={onUpdate}
    />
  );
}
