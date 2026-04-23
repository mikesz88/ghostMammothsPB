/**
 * Shared JSON-safe DTOs for member (`app/events/[id]`) and admin (`app/admin/events/[id]`)
 * event-detail payloads. Phase 4 PR 1: single source of truth for overlapping shapes.
 *
 * Intentional differences (do not “merge” without a dedicated PR):
 * - **Member** `EventDetailSerializedEvent` adds optional `time` and `numCourts` for display/legacy.
 * - **Admin** `AdminSerializedCourtAssignment` includes `queueEntryIds` via `CourtAssignment` scalars;
 *   **member** `EventDetailSerializedAssignment` omits `queueEntryIds` (member hydrate does not set it today).
 * - **Admin-only** queue rows: `AdminSerializedQueueEntry` stays in `hydrate-admin-event-detail.ts`.
 */
import type { EventStatus, RotationType, TeamSize } from "@/lib/types";

/** User snapshot in wire format (identical for both routes). */
export type EventDetailSharedSerializedUser = {
  id: string;
  email: string;
  name: string;
  skillLevel: string;
  isAdmin: boolean;
  createdAt: string;
};

/** Event fields shared by both routes (ISO-8601 strings for instants). */
export type EventDetailSharedSerializedEventCore = {
  id: string;
  name: string;
  location: string;
  date: string;
  courtCount: number;
  teamSize: TeamSize;
  rotationType: RotationType;
  status: EventStatus;
  createdAt: string;
  updatedAt?: string;
};

/** Nested players on a serialized court assignment (both routes). */
export type EventDetailSharedSerializedCourtPlayers = {
  player1?: EventDetailSharedSerializedUser;
  player2?: EventDetailSharedSerializedUser;
  player3?: EventDetailSharedSerializedUser;
  player4?: EventDetailSharedSerializedUser;
  player5?: EventDetailSharedSerializedUser;
  player6?: EventDetailSharedSerializedUser;
  player7?: EventDetailSharedSerializedUser;
  player8?: EventDetailSharedSerializedUser;
};
