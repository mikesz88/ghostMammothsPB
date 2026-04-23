import type {
  GroupSize,
  QueueEntry,
  QueueStatus,
  SkillLevel,
} from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";

type QueueEntryRow = Database["public"]["Tables"]["queue_entries"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type QueueEntryWithUser = QueueEntryRow & { user: UserRow | null };

function mapQueueEntryUserRow(user: UserRow): NonNullable<QueueEntry["user"]> {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone || undefined,
    skillLevel: user.skill_level as SkillLevel,
    isAdmin: user.is_admin,
    createdAt: new Date(user.created_at),
  };
}

export function mapRealtimeQueueEntry(entry: QueueEntryWithUser): QueueEntry {
  return {
    id: entry.id,
    eventId: entry.event_id,
    userId: entry.user_id,
    groupId: entry.group_id ?? undefined,
    groupSize: entry.group_size as GroupSize,
    position: entry.position,
    status: entry.status as QueueStatus,
    joinedAt: new Date(entry.joined_at),
    user: entry.user ? mapQueueEntryUserRow(entry.user) : undefined,
  };
}
