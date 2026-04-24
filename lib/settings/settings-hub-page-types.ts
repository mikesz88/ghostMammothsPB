import type { UserMembershipInfo } from "@/lib/membership/user-membership-types";
import type { Database } from "@/supabase/supa-schema";

export type SettingsHubUsersRow = Database["public"]["Tables"]["users"]["Row"];

/** Auth fields needed on the settings hub (JSON-safe for client props). */
export type SettingsHubSessionDisplay = {
  email: string;
  emailConfirmedAt: string | null;
  createdAt: string;
  metadataName: string | null;
};

export type SettingsHubPageClientProps = {
  session: SettingsHubSessionDisplay;
  userDetails: SettingsHubUsersRow | null;
  membership: UserMembershipInfo;
};
