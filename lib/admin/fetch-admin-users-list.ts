import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminUsersListRow = Database["public"]["Tables"]["users"]["Row"];

/** Shared list query for admin users (server loader + `getAllUsers` action). */
export async function fetchAdminUsersList(
  supabase: SupabaseClient<Database>,
  searchQuery?: string,
): Promise<{ data: AdminUsersListRow[] | null; error: string | null }> {
  let query = supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching users:", error);
    return { data: null, error: error.message };
  }

  return { data: data ?? [], error: null };
}
