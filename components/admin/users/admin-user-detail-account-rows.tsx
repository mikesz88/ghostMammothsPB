import { Badge } from "@/components/ui/badge";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";

export function AdminUserDetailMembershipRow({
  user,
}: {
  user: AdminUserDetailRecord;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">Membership</p>
      <Badge variant="secondary">{user.membership_status || "Free"}</Badge>
    </div>
  );
}

export function AdminUserDetailSkillRow({
  user,
}: {
  user: AdminUserDetailRecord;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">Skill Level</p>
      <Badge variant="outline">{user.skill_level}</Badge>
    </div>
  );
}

export function AdminUserDetailMemberSinceRow({
  user,
}: {
  user: AdminUserDetailRecord;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">Member Since</p>
      <p className="text-sm font-medium text-foreground">
        {new Date(user.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
