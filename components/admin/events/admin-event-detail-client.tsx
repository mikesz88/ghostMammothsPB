import { AdminEventDetailBody } from "@/components/admin/events/admin-event-detail-body";
import { Header } from "@/components/ui/header";

import type { AdminEventDetailPagePayload } from "@/lib/admin/admin-event-detail-server";

export function AdminEventDetailClient(payload: AdminEventDetailPagePayload) {
  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="admin"
        backButton={{ href: "/admin", label: "Back to Dashboard" }}
      />
      <AdminEventDetailBody payload={payload} />
    </div>
  );
}
