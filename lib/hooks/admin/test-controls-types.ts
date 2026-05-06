import type { RotationType } from "@/lib/types";

export interface UseTestControlsArgs {
  eventId: string;
  currentRotationType: RotationType;
  currentTeamSize: number;
  currentCourtCount: number;
  onQueueUpdated?: () => void | Promise<void>;
}
