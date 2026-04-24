"use client";

import { useMemo } from "react";

import { adminDashboardInitialEventToEvent } from "@/lib/admin/admin-dashboard-event-dto";

import type { AdminDashboardInitialEvent } from "@/lib/admin/admin-dashboard-event-dto";

export function useAdminDashboardEventsFromInitial(
  initialEvents: AdminDashboardInitialEvent[],
) {
  return useMemo(
    () => initialEvents.map(adminDashboardInitialEventToEvent),
    [initialEvents],
  );
}
