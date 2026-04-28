import "server-only";

import { createClient } from "@/lib/supabase/server";

import type { HeaderServerSnapshot } from "@/components/ui/header/header-client";

export async function loadHomeAuthSnapshot(): Promise<HeaderServerSnapshot | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  return {
    userId: user.id,
    isAdmin: data?.is_admin ?? false,
  };
}
