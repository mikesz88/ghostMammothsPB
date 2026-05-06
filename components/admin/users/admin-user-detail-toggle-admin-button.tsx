import { Shield, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";

export function AdminUserDetailToggleAdminButton({
  user,
  onClick,
}: {
  user: AdminUserDetailRecord;
  onClick: () => void;
}) {
  return (
    <Button variant={user.is_admin ? "outline" : "default"} onClick={onClick}>
      {user.is_admin ? (
        <>
          <ShieldOff className="w-4 h-4 mr-2" />
          Remove Admin
        </>
      ) : (
        <>
          <Shield className="w-4 h-4 mr-2" />
          Make Admin
        </>
      )}
    </Button>
  );
}
