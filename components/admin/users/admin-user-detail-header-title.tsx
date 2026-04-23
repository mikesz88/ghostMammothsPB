import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";

export function AdminUserDetailHeaderTitle({
  user,
}: {
  user: AdminUserDetailRecord;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-4xl font-bold text-foreground">{user.name}</h1>
        {user.is_admin ? (
          <Badge variant="default">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        ) : null}
      </div>
      <p className="text-muted-foreground">{user.email}</p>
    </div>
  );
}
