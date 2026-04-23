import { AdminDashboardPageHeader } from "@/components/admin/dashboard/admin-dashboard-page-header";
import { AdminDashboardStatsGrid } from "@/components/admin/dashboard/admin-dashboard-stats-grid";

export function AdminDashboardPageMainTop({
  activeCount,
  totalCourts,
  endedCount,
  onCreateClick,
}: {
  activeCount: number;
  totalCourts: number;
  endedCount: number;
  onCreateClick: () => void;
}) {
  return (
    <>
      <AdminDashboardPageHeader onCreateClick={onCreateClick} />
      <AdminDashboardStatsGrid
        activeCount={activeCount}
        totalCourts={totalCourts}
        endedCount={endedCount}
      />
    </>
  );
}
