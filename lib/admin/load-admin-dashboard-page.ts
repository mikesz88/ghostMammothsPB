import {
  mapEventRowToAdminDashboardInitialEvent,
  type AdminDashboardInitialEvent,
} from "@/lib/admin/admin-dashboard-event-dto";
import { fetchAdminDashboardEvents } from "@/lib/admin/fetch-admin-dashboard-events";
import { requireAdminSession } from "@/lib/admin/require-admin-session";

export async function loadAdminDashboardPageData(): Promise<{
  events: AdminDashboardInitialEvent[];
}> {
  const supabase = await requireAdminSession();
  const { data, error } = await fetchAdminDashboardEvents(supabase);
  if (error) {
    console.error("loadAdminDashboardPageData:", error);
    return { events: [] };
  }
  return {
    events: (data ?? []).map(mapEventRowToAdminDashboardInitialEvent),
  };
}
