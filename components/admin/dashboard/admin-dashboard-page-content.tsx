import { AdminDashboardPageMain } from "@/components/admin/dashboard/admin-dashboard-page-main";
import { partitionAdminDashboardEvents } from "@/lib/admin/admin-dashboard-partition-events";

import type { Event } from "@/lib/types";

export type AdminDashboardPageContentProps = {
  events: Event[];
  onCreateClick: () => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onEnd: (eventId: string) => void;
};

export function AdminDashboardPageContent({
  events,
  ...handlers
}: AdminDashboardPageContentProps) {
  return (
    <AdminDashboardPageMain
      {...partitionAdminDashboardEvents(events)}
      {...handlers}
    />
  );
}
