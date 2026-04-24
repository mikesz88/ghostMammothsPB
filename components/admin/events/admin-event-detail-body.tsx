"use client";

import { AdminEventDetailColumns } from "@/components/admin/events/admin-event-detail-columns";
import { AdminEventDetailTestStrip } from "@/components/admin/events/admin-event-detail-test-strip";
import { useAdminEventDetailClient } from "@/lib/hooks/use-admin-event-detail-client";

import type { AdminEventDetailPagePayload } from "@/lib/admin/admin-event-detail-server";

export function AdminEventDetailBody({
  payload,
}: {
  payload: AdminEventDetailPagePayload;
}) {
  const v = useAdminEventDetailClient(payload);
  return (
    <div className="container mx-auto px-4 py-8">
      {payload.isTestEvent ? <AdminEventDetailTestStrip v={v} /> : null}
      <AdminEventDetailColumns v={v} />
    </div>
  );
}
