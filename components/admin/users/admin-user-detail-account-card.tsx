import {
  AdminUserDetailMemberSinceRow,
  AdminUserDetailMembershipRow,
  AdminUserDetailSkillRow,
} from "@/components/admin/users/admin-user-detail-account-rows";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";

export function AdminUserDetailAccountCard({
  user,
}: {
  user: AdminUserDetailRecord;
}) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground text-lg">Account Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AdminUserDetailMembershipRow user={user} />
        <AdminUserDetailSkillRow user={user} />
        <AdminUserDetailMemberSinceRow user={user} />
      </CardContent>
    </Card>
  );
}
