import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

/** Row returned by admin user-detail select (counts are JSON-serializable). */
export type AdminUserDetailRecord = UserRow & {
  queue_entries?: unknown;
  event_registrations?: unknown;
};

const ADMIN_USER_DETAIL_SELECT = `
  *,
  queue_entries(count),
  event_registrations:event_registrations(count)
`;

/** Shared user-by-id read for admin detail loader + `getUserById` action. */
export async function fetchAdminUserById(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ data: AdminUserDetailRecord | null; error: string | null }> {
  const { data, error } = await supabase
    .from("users")
    .select(ADMIN_USER_DETAIL_SELECT)
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return { data: null, error: error.message };
  }

  return { data: data as AdminUserDetailRecord, error: null };
}
