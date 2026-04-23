"use client";

import { AdminUsersPageBody } from "@/components/admin/users/admin-users-page-body";
import { Header } from "@/components/ui/header";
import { useAdminUsersPage } from "@/lib/hooks/use-admin-users-page";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

export function AdminUsersPageClient({
  initialUsers,
}: {
  initialUsers: AdminUsersListRow[];
}) {
  const page = useAdminUsersPage(initialUsers);
  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <AdminUsersPageBody {...page} />
    </div>
  );
}
