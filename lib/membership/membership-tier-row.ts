import type { Database } from "@/supabase/supa-schema";

export type MembershipTierRow =
  Database["public"]["Tables"]["membership_tiers"]["Row"];
