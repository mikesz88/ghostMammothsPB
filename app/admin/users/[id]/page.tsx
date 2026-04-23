import { notFound } from "next/navigation";

import { AdminUserDetailPageClient } from "@/components/admin/users/admin-user-detail-page-client";
import { loadAdminUserDetailPageData } from "@/lib/admin/load-admin-user-detail-page";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payload = await loadAdminUserDetailPageData(id);
  if (!payload) {
    notFound();
  }
  return <AdminUserDetailPageClient initialUser={payload.user} />;
}
