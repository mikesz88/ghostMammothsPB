import { fetchAdminUsersList } from "@/lib/admin/fetch-admin-users-list";
import { requireAdminSession } from "@/lib/admin/require-admin-session";

import type { AdminUsersListRow } from "@/lib/admin/fetch-admin-users-list";

export async function loadAdminUsersPageData(): Promise<{
  users: AdminUsersListRow[];
}> {
  const supabase = await requireAdminSession();
  const { data, error } = await fetchAdminUsersList(supabase);
  if (error) {
    console.error("loadAdminUsersPageData:", error);
    return { users: [] };
  }
  return { users: data ?? [] };
}
