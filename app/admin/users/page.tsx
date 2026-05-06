import { AdminUsersPageClient } from "@/components/admin/users/admin-users-page-client";
import { loadAdminUsersPageData } from "@/lib/admin/load-admin-users-page";

export default async function AdminUsersPage() {
  const { users } = await loadAdminUsersPageData();
  return <AdminUsersPageClient initialUsers={users} />;
}
