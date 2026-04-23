"use client";

import { useCallback } from "react";

import { runAdminDashboardUpdateEvent } from "@/lib/hooks/admin-dashboard-run-update-event";

import type { Event } from "@/lib/types";

export function useAdminDashboardUpdateEvent(
  refresh: () => void,
  editingEvent: Event | null,
  setEditingEvent: (e: Event | null) => void,
) {
  return useCallback(
    async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt">) => {
      if (!editingEvent) return;
      await runAdminDashboardUpdateEvent(
        eventData,
        editingEvent,
        refresh,
        setEditingEvent,
      );
    },
    [editingEvent, refresh, setEditingEvent],
  );
}
