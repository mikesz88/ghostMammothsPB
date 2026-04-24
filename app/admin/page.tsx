import { AdminDashboardPageClient } from "@/components/admin/dashboard/admin-dashboard-page-client";
import { loadAdminDashboardPageData } from "@/lib/admin/load-admin-dashboard-page";

export default async function AdminPage() {
  const { events } = await loadAdminDashboardPageData();
  return <AdminDashboardPageClient initialEvents={events} />;
}
