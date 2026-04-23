"use client";

import { useAdminDashboardConfirmHandlers } from "@/lib/hooks/use-admin-dashboard-confirm-handlers";
import { useAdminDashboardCreateEvent } from "@/lib/hooks/use-admin-dashboard-create-event";
import { useAdminDashboardUpdateEvent } from "@/lib/hooks/use-admin-dashboard-update-event";

import type { Event } from "@/lib/types";
import type { Dispatch, SetStateAction } from "react";

export function useAdminDashboardAllHandlers(
  refresh: () => void,
  editingEvent: Event | null,
  setEditingEvent: Dispatch<SetStateAction<Event | null>>,
  setShowCreateDialog: Dispatch<SetStateAction<boolean>>,
) {
  const handleCreate = useAdminDashboardCreateEvent(
    refresh,
    setShowCreateDialog,
  );
  const handleUpdate = useAdminDashboardUpdateEvent(
    refresh,
    editingEvent,
    setEditingEvent,
  );
  const { handleEndEvent, handleDeleteEvent } =
    useAdminDashboardConfirmHandlers(refresh);
  return {
    handleCreate,
    handleUpdate,
    handleEndEvent,
    handleDeleteEvent,
  };
}
