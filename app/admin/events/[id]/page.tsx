import { notFound } from "next/navigation";

import { AdminEventDetailClient } from "@/components/admin/events/admin-event-detail-client";
import { loadAdminEventDetailPageData } from "@/lib/admin/admin-event-detail-server";

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadAdminEventDetailPageData(id);

  if (!data) {
    notFound();
  }

  return <AdminEventDetailClient {...data} />;
}
