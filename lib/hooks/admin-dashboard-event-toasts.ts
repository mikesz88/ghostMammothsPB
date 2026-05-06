"use client";

import { toast } from "sonner";

import {
  deleteAdminDashboardEvent,
  endAdminDashboardEvent,
} from "@/app/actions/events";

async function endThenRefresh(eventId: string, refresh: () => void) {
  const result = await endAdminDashboardEvent(eventId);
  if (!result.success) {
    toast.error("Failed to end event", { description: result.error });
    return;
  }
  refresh();
  toast.success("Event ended successfully!", {
    description: "All queue entries and assignments cleared.",
  });
}

async function deleteThenRefresh(eventId: string, refresh: () => void) {
  const result = await deleteAdminDashboardEvent(eventId);
  if (!result.success) {
    toast.error("Failed to delete event", { description: result.error });
    return;
  }
  refresh();
  toast.success("Event deleted successfully!");
}

export function toastConfirmEndAdminEvent(
  eventId: string,
  refresh: () => void,
) {
  toast("End this event?", {
    description: "This will clear all queue entries and court assignments.",
    action: {
      label: "End Event",
      onClick: () => {
        void endThenRefresh(eventId, refresh);
      },
    },
    cancel: {
      label: "Cancel",
      onClick: () => {},
    },
  });
}

export function toastConfirmDeleteAdminEvent(
  eventId: string,
  refresh: () => void,
) {
  toast("Delete this event?", {
    description:
      "This will remove all queue entries and court assignments. This action cannot be undone.",
    action: {
      label: "Delete",
      onClick: () => {
        void deleteThenRefresh(eventId, refresh);
      },
    },
    cancel: {
      label: "Cancel",
      onClick: () => {},
    },
  });
}
