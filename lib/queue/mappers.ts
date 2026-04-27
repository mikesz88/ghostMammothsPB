import type { QueueEntryWithUser } from "@/lib/queue/types";
import type { GroupSize } from "@/lib/types";

function parsePlayerNames(
  raw: unknown,
): Array<{ name: string; skillLevel: string }> {
  if (!raw) return [];
  try {
    const parsed = raw as unknown as Array<{
      name: string;
      skillLevel: string;
    }>;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapEntryUser(entry: QueueEntryWithUser) {
  if (!entry.user) return undefined;
  return {
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
  };
}

export function mapDbEntryToManagerEntry(entry: QueueEntryWithUser) {
  return {
    id: entry.id,
    eventId: entry.event_id,
    userId: entry.user_id,
    groupId: entry.group_id || undefined,
    groupSize: (entry.group_size || 1) as GroupSize,
    player_names: parsePlayerNames(entry.player_names),
    position: entry.position,
    status: entry.status as
      | "waiting"
      | "pending_solo"
      | "playing"
      | "completed"
      | "pending_stay",
    joinedAt: new Date(entry.joined_at),
    user: mapEntryUser(entry),
  };
}

export function countSlotsForEntries(
  entries: Array<{ groupSize?: GroupSize }>,
): number {
  return entries.reduce((sum, entry) => sum + (entry.groupSize || 1), 0);
}
