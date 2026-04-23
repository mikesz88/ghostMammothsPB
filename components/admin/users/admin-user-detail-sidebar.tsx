import { AdminUserDetailAccountCard } from "@/components/admin/users/admin-user-detail-account-card";
import { AdminUserDetailActivityStatsCard } from "@/components/admin/users/admin-user-detail-activity-stats-card";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";

export function AdminUserDetailSidebar({
  user,
}: {
  user: AdminUserDetailRecord;
}) {
  return (
    <div className="space-y-6">
      <AdminUserDetailAccountCard user={user} />
      <AdminUserDetailActivityStatsCard />
    </div>
  );
}
