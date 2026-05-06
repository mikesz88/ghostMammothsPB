"use client";

import { toast } from "sonner";

import { updateAdminDashboardEvent } from "@/app/actions/events";
import { adminDashboardUpsertPayloadFromEventForm } from "@/lib/admin/admin-dashboard-event-upsert";
import { toastIfInvalid2Stay2Off } from "@/lib/hooks/admin-dashboard-event-form-guard";

import type { Event } from "@/lib/types";

export async function runAdminDashboardUpdateEvent(
  eventData: Omit<Event, "id" | "createdAt" | "updatedAt">,
  editingEvent: Event,
  refresh: () => void,
  setEditingEvent: (e: Event | null) => void,
) {
  if (!toastIfInvalid2Stay2Off(eventData)) return;
  const payload = adminDashboardUpsertPayloadFromEventForm(eventData);
  const result = await updateAdminDashboardEvent(editingEvent.id, payload);
  if (!result.success) {
    toast.error("Failed to update event", { description: result.error });
    return;
  }
  refresh();
  setEditingEvent(null);
  toast.success("Event updated successfully!");
}
