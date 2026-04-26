import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export type QueueEntryRow = Database["public"]["Tables"]["queue_entries"]["Row"];

export type CourtAssignmentInsert =
  Database["public"]["Tables"]["court_assignments"]["Insert"] & {
    player_names?: string[]; // JSON field that may not be in schema
    queue_entry_ids?: string[]; // JSON field that may not be in schema
  };

// Query result with joined user fields used by queue logic.
export type QueueEntryWithUser = QueueEntryRow & {
  player_names?: unknown; // JSON field that may not be in schema
  user: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
};

export type GameEntryRow = {
  id: string;
  user_id: string;
  group_size: number | null;
  position: number;
};

export type DbClient = SupabaseClient<Database>;
