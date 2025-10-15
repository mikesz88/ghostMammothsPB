import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/supabase/supa-schema";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
