"use client";

import { toast } from "sonner";

import { createAdminDashboardEvent } from "@/app/actions/events";
import { adminDashboardUpsertPayloadFromEventForm } from "@/lib/admin/admin-dashboard-event-upsert";
import { toastIfInvalid2Stay2Off } from "@/lib/hooks/admin-dashboard-event-form-guard";

import type { Event } from "@/lib/types";

export async function runAdminDashboardCreateEvent(
  eventData: Omit<Event, "id" | "createdAt" | "updatedAt">,
  refresh: () => void,
  setShowCreateDialog: (open: boolean) => void,
) {
  if (!toastIfInvalid2Stay2Off(eventData)) return;
  const payload = adminDashboardUpsertPayloadFromEventForm(eventData);
  const result = await createAdminDashboardEvent(payload);
  if (!result.success) {
    toast.error("Failed to create event", { description: result.error });
    return;
  }
  refresh();
  setShowCreateDialog(false);
  toast.success("Event created successfully!");
}
