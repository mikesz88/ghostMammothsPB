import "server-only";

import { requireUserSession } from "@/lib/auth/require-user-session";
import { getUserMembership } from "@/lib/membership/get-user-membership";

import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";
import type { SettingsHubSessionDisplay } from "@/lib/settings/settings-hub-page-types";
import type { Database } from "@/supabase/supa-schema";
import type { User } from "@supabase/supabase-js";

type UsersRow = Database["public"]["Tables"]["users"]["Row"];

function buildSettingsHubSessionDisplay(user: User): SettingsHubSessionDisplay {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const name = meta?.name;
  return {
    email: user.email ?? "",
    emailConfirmedAt: user.email_confirmed_at ?? user.confirmed_at ?? null,
    createdAt: user.created_at,
    metadataName: typeof name === "string" ? name : null,
  };
}

export async function loadSettingsHubPageData(): Promise<{
  session: SettingsHubSessionDisplay;
  userDetails: UsersRow | null;
  membership: UserMembershipInfo;
}> {
  const { supabase, user } = await requireUserSession();
  const [userRes, membership] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
    getUserMembership(user.id, supabase),
  ]);
  return {
    session: buildSettingsHubSessionDisplay(user),
    userDetails: userRes.data ?? null,
    membership,
  };
}
