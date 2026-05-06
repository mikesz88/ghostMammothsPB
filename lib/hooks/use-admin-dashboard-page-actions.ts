"use client";

import { useAdminDashboardAllHandlers } from "@/lib/hooks/use-admin-dashboard-all-handlers";
import { useAdminDashboardEventsFromInitial } from "@/lib/hooks/use-admin-dashboard-events-from-initial";
import { useAdminDashboardRouterRefresh } from "@/lib/hooks/use-admin-dashboard-router-refresh";

import type { AdminDashboardInitialEvent } from "@/lib/admin/admin-dashboard-event-dto";
import type { Event } from "@/lib/types";
import type { Dispatch, SetStateAction } from "react";

export function useAdminDashboardPageActions(
  initialEvents: AdminDashboardInitialEvent[],
  editingEvent: Event | null,
  setEditingEvent: Dispatch<SetStateAction<Event | null>>,
  setShowCreateDialog: Dispatch<SetStateAction<boolean>>,
) {
  const refresh = useAdminDashboardRouterRefresh();
  const events = useAdminDashboardEventsFromInitial(initialEvents);
  const handlers = useAdminDashboardAllHandlers(
    refresh,
    editingEvent,
    setEditingEvent,
    setShowCreateDialog,
  );
  return { events, ...handlers };
}
