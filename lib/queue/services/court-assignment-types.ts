import type {
  AssignPlayersFail,
  CourtPendingStayerRow,
  EventRow,
  ManagerEntry,
} from "@/lib/queue/services/court-assignment-helpers";
import type { DbClient } from "@/lib/queue/types";
import type { RotationType } from "@/lib/types";

export type CourtAssignmentReadyCtx = {
  supabase: DbClient;
  event: EventRow;
  availableCourt: number;
  playersPerCourt: number;
  rotationType: RotationType;
  stayingMapped: ManagerEntry[];
  pendingRow: CourtPendingStayerRow;
  nextPlayers: ManagerEntry[];
};

export type LoadCourtAssignmentResult =
  | AssignPlayersFail
  | { success: true; ctx: CourtAssignmentReadyCtx };
