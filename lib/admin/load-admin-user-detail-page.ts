import { fetchAdminUserById } from "@/lib/admin/fetch-admin-user-by-id";
import { requireAdminSession } from "@/lib/admin/require-admin-session";

import type { AdminUserDetailRecord } from "@/lib/admin/fetch-admin-user-by-id";

export async function loadAdminUserDetailPageData(
  userId: string,
): Promise<{ user: AdminUserDetailRecord } | null> {
  const supabase = await requireAdminSession();
  const { data, error } = await fetchAdminUserById(supabase, userId);
  if (error || !data) return null;
  return { user: data };
}
