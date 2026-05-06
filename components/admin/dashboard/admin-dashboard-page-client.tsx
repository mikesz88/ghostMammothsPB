"use client";

import { AdminDashboardPageClientView } from "@/components/admin/dashboard/admin-dashboard-page-client-view";
import { useAdminDashboardPageClientState } from "@/lib/hooks/use-admin-dashboard-page-client-state";

import type { AdminDashboardInitialEvent } from "@/lib/admin/admin-dashboard-event-dto";

export function AdminDashboardPageClient({
  initialEvents,
}: {
  initialEvents: AdminDashboardInitialEvent[];
}) {
  const state = useAdminDashboardPageClientState(initialEvents);
  return <AdminDashboardPageClientView {...state} />;
}
