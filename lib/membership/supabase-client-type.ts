import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AppSupabaseClient = SupabaseClient<Database>;
