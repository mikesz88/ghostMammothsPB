"use client";

import { useCallback } from "react";

import {
  toastConfirmDeleteAdminEvent,
  toastConfirmEndAdminEvent,
} from "@/lib/hooks/admin-dashboard-event-toasts";

export function useAdminDashboardConfirmHandlers(refresh: () => void) {
  const handleEndEvent = useCallback(
    (eventId: string) => toastConfirmEndAdminEvent(eventId, refresh),
    [refresh],
  );
  const handleDeleteEvent = useCallback(
    (eventId: string) => toastConfirmDeleteAdminEvent(eventId, refresh),
    [refresh],
  );
  return { handleEndEvent, handleDeleteEvent };
}
