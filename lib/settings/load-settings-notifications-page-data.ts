import "server-only";

import { requireUserSession } from "@/lib/auth/require-user-session";

export async function loadSettingsNotificationsPageData(): Promise<{
  email: string | null;
}> {
  const { supabase, user } = await requireUserSession();
  const { data } = await supabase
    .from("users")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();
  return { email: data?.email ?? user.email ?? null };
}
