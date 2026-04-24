"use client";

import { useState } from "react";

import { useAdminDashboardPageActions } from "@/lib/hooks/use-admin-dashboard-page-actions";

import type { AdminDashboardInitialEvent } from "@/lib/admin/admin-dashboard-event-dto";
import type { Event } from "@/lib/types";

export function useAdminDashboardPageClientState(
  initialEvents: AdminDashboardInitialEvent[],
) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const actions = useAdminDashboardPageActions(
    initialEvents,
    editingEvent,
    setEditingEvent,
    setShowCreateDialog,
  );
  return {
    showCreateDialog,
    setShowCreateDialog,
    editingEvent,
    setEditingEvent,
    ...actions,
  };
}
