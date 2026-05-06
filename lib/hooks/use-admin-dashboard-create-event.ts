"use client";

import { useCallback } from "react";

import { runAdminDashboardCreateEvent } from "@/lib/hooks/admin-dashboard-run-create-event";

import type { Event } from "@/lib/types";

export function useAdminDashboardCreateEvent(
  refresh: () => void,
  setShowCreateDialog: (open: boolean) => void,
) {
  return useCallback(
    async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt">) => {
      await runAdminDashboardCreateEvent(
        eventData,
        refresh,
        setShowCreateDialog,
      );
    },
    [refresh, setShowCreateDialog],
  );
}
