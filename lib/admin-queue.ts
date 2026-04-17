import { createClient } from "@/lib/supabase/client";
import type {
  QueueEntry,
  GroupSize,
  QueueStatus,
  SkillLevel,
} from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";

type QueueEntryRow = Database["public"]["Tables"]["queue_entries"]["Row"];
type QueueEntryWithUser = QueueEntryRow & {
  player_names?: unknown;
  user: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
};

export const adminQueueQueryKey = (eventId: string) =>
  ["admin-queue", eventId] as const;

export async function fetchAdminQueueEntries(
  eventId: string,
): Promise<QueueEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("queue_entries")
    .select(
      `
          *,
          user:users(id, name, email, skill_level)
        `,
    )
    .eq("event_id", eventId)
    .order("position");

  if (error) {
    console.error("Error fetching queue:", error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((entry: QueueEntryWithUser) => {
    let playerNamesArray: Array<{
      name: string;
      skillLevel: string;
    }> = [];
    if (entry.player_names) {
      try {
        const parsed = entry.player_names as unknown as Array<{
          name: string;
          skillLevel: string;
        }>;
        playerNamesArray = Array.isArray(parsed) ? parsed : [];
      } catch {
        playerNamesArray = [];
      }
    }

    return {
      id: entry.id,
      eventId: entry.event_id,
      userId: entry.user_id,
      groupSize: (entry.group_size || 1) as GroupSize,
      groupId: entry.group_id || undefined,
      player_names: playerNamesArray,
      position: entry.position,
      status: entry.status as QueueStatus,
      joinedAt: new Date(entry.joined_at),
      user: entry.user
        ? {
            id: entry.user.id,
            name: entry.user.name,
            email: entry.user.email,
            skillLevel: entry.user.skill_level as SkillLevel,
            isAdmin: false,
            createdAt: new Date(),
          }
        : undefined,
    };
  });
}
