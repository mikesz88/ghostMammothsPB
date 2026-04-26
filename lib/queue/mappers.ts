import type { GroupSize } from "@/lib/types";
import type { QueueEntryWithUser } from "@/lib/queue/types";

export function mapDbEntryToManagerEntry(entry: QueueEntryWithUser) {
  let playerNamesArray: Array<{ name: string; skillLevel: string }> = [];
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
    groupId: entry.group_id || undefined,
    groupSize: (entry.group_size || 1) as GroupSize,
    player_names: playerNamesArray,
    position: entry.position,
    status: entry.status as
      | "waiting"
      | "pending_solo"
      | "playing"
      | "completed"
      | "pending_stay",
    joinedAt: new Date(entry.joined_at),
    user: entry.user
      ? {
          id: entry.user.id,
          name: entry.user.name,
          email: entry.user.email,
          skillLevel: entry.user.skill_level as
            | "beginner"
            | "intermediate"
            | "advanced"
            | "pro",
          isAdmin: false,
          createdAt: new Date(),
        }
      : undefined,
  };
}

export function countSlotsForEntries(
  entries: Array<{ groupSize?: GroupSize }>,
): number {
  return entries.reduce((sum, entry) => sum + (entry.groupSize || 1), 0);
}
