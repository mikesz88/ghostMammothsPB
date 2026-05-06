import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function requireUserSession(): Promise<{
  supabase: SupabaseClient<Database>;
  user: User;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return { supabase, user };
}
