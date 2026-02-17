import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/supa-schema";

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  try {
    return createClient<Database>(url, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });
  } catch (error) {
    console.error("Failed to initialize Supabase service role client:", error);
    return null;
  }
}
