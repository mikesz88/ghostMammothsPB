import { Plus } from "lucide-react";

import { AdminDashboardPageHeaderTitle } from "@/components/admin/dashboard/admin-dashboard-page-header-title";
import { Button } from "@/components/ui/button";

export function AdminDashboardPageHeader({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <AdminDashboardPageHeaderTitle />
      <Button onClick={onCreateClick} size="lg" className="w-full sm:w-auto">
        <Plus className="w-4 h-4 mr-2" />
        Create Event
      </Button>
    </div>
  );
}
