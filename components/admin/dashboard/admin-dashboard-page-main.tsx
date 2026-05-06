import { AdminDashboardActiveEventsSection } from "@/components/admin/dashboard/admin-dashboard-active-events-section";
import { AdminDashboardEndedEventsSection } from "@/components/admin/dashboard/admin-dashboard-ended-events-section";
import { AdminDashboardPageMainTop } from "@/components/admin/dashboard/admin-dashboard-page-main-top";

import type { Event } from "@/lib/types";

type AdminDashboardPageMainHandlers = {
  onCreateClick: () => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onEnd: (eventId: string) => void;
};

type AdminDashboardPageMainProps = {
  activeEvents: Event[];
  endedEvents: Event[];
  totalCourts: number;
} & AdminDashboardPageMainHandlers;

function AdminDashboardPageMainInner({
  activeEvents,
  endedEvents,
  totalCourts,
  ...handlers
}: AdminDashboardPageMainProps) {
  return (
    <>
      <AdminDashboardPageMainTop
        activeCount={activeEvents.length}
        totalCourts={totalCourts}
        endedCount={endedEvents.length}
        onCreateClick={handlers.onCreateClick}
      />
      <AdminDashboardActiveEventsSection
        events={activeEvents}
        {...handlers}
      />
      <AdminDashboardEndedEventsSection
        events={endedEvents}
        onDelete={handlers.onDelete}
      />
    </>
  );
}

export function AdminDashboardPageMain(props: AdminDashboardPageMainProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <AdminDashboardPageMainInner {...props} />
    </div>
  );
}
