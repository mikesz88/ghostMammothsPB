import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminServiceDb = SupabaseClient<Database>;

export type AdminServiceDbGate =
  | { db: AdminServiceDb; error: null }
  | { db: null; error: string };

async function adminAuthError(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Not authenticated";
  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return "Unauthorized - Admin access required";
  return null;
}

export async function requireAdminServiceDb(): Promise<AdminServiceDbGate> {
  const supabase = await createClient();
  const err = await adminAuthError(supabase);
  if (err) return { db: null, error: err };
  const db = createServiceRoleClient();
  if (!db) {
    console.error("requireAdminServiceDb: SUPABASE_SERVICE_ROLE_KEY missing");
    return { db: null, error: "Server configuration error" };
  }
  return { db, error: null };
}
