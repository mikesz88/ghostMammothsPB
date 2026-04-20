"use client";

import { Clock, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { QueueEntry } from "@/lib/types";

interface QueueListProps {
  queue: QueueEntry[];
  onRemove?: (entryId: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

// Skill level mapping for weighted average calculation
const skillLevelToNumber: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  pro: 4,
};

const numberToSkillLevel: Record<number, string> = {
  1: "beginner",
  2: "intermediate",
  3: "advanced",
  4: "pro",
};

// Calculate weighted average skill level for a group
function getAverageSkillLevel(
  playerNames: Array<{ name: string; skillLevel: string }> | undefined,
  fallbackSkillLevel?: string,
): string {
  if (!playerNames || playerNames.length === 0) {
    return fallbackSkillLevel || "intermediate";
  }

  // Convert skill levels to numbers and calculate average
  const skillNumbers = playerNames
    .map((player) => skillLevelToNumber[player.skillLevel] || 2)
    .filter((num) => num !== undefined);

  if (skillNumbers.length === 0) {
    return fallbackSkillLevel || "intermediate";
  }

  const average =
    skillNumbers.reduce((sum, num) => sum + num, 0) / skillNumbers.length;

  // Round to nearest integer (weighted average)
  const roundedAverage = Math.round(average);

  // Ensure it's within valid range (1-4)
  const clampedAverage = Math.max(1, Math.min(4, roundedAverage));

  return numberToSkillLevel[clampedAverage] || "intermediate";
}

export function QueueList({
  queue,
  onRemove,
  currentUserId,
  isAdmin = false,
}: QueueListProps) {
  /** Single ordered line: assignable + pending solos (same position ordering). */
  const lineQueue = queue
    .filter(
      (entry) =>
        entry.status === "waiting" || entry.status === "pending_solo"
    )
    .sort((a, b) => a.position - b.position);

  const pendingStayQueue = queue
    .filter((entry) => entry.status === "pending_stay")
    .sort((a, b) => a.position - b.position);

  function buildGrouped(entries: QueueEntry[]) {
    const grouped: (QueueEntry | QueueEntry[])[] = [];
    const processed = new Set<string>();
    for (const entry of entries) {
      if (entry.groupId && !processed.has(entry.groupId)) {
        const groupMembers = entries.filter((e) => e.groupId === entry.groupId);
        grouped.push(groupMembers);
        processed.add(entry.groupId);
      } else if (!entry.groupId) {
        grouped.push(entry);
      }
    }
    return grouped;
  }

  const groupedLine = buildGrouped(lineQueue);
  const groupedPending = buildGrouped(pendingStayQueue);

  if (lineQueue.length === 0 && pendingStayQueue.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No one in queue yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {groupedPending.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-muted-foreground px-1">
            On deck for next game (winners stay)
          </p>
          {groupedPending.map((item) => {
            const isGroup = Array.isArray(item);
            const entries = isGroup ? item : [item];
            const firstEntry = entries[0];
            return (
              <Card
                key={isGroup ? firstEntry.groupId : firstEntry.id}
                className="border-amber-500/40 bg-amber-500/5"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="shrink-0">
                      On deck
                    </Badge>
                    <span className="font-medium text-foreground">
                      {firstEntry.player_names &&
                      firstEntry.player_names.length > 0
                        ? firstEntry.player_names.map((p) => p.name).join(", ")
                        : firstEntry.user?.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {groupedLine.map((item) => {
        const isGroup = Array.isArray(item);
        const entries = isGroup ? item : [item];
        const firstEntry = entries[0];
        const isCurrentUser = entries.some((e) => e.userId === currentUserId);
        const isPendingSolo = firstEntry.status === "pending_solo";

        return (
          <Card
            key={isGroup ? firstEntry.groupId : firstEntry.id}
            className={`bg-card hover:border-primary/50 transition-colors ${
              isPendingSolo
                ? "border-dashed border-sky-500/50 bg-sky-500/5"
                : "border-border"
            } ${isCurrentUser ? "ring-2 ring-primary" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      #{firstEntry.position}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-foreground">
                        Group of {firstEntry.groupSize || entries.length}
                      </p>
                      {isPendingSolo && (
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0 border-sky-500/50 text-sky-700 dark:text-sky-300"
                        >
                          Waiting for more solo players
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs shrink-0">
                        {getAverageSkillLevel(
                          firstEntry.player_names,
                          firstEntry.user?.skillLevel,
                        )}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {firstEntry.player_names &&
                      firstEntry.player_names.length > 0 ? (
                        firstEntry.player_names.map((player, idx) => (
                          <span key={idx}>{player.name}</span>
                        ))
                      ) : isGroup ? (
                        entries.map((entry) => (
                          <span key={entry.id}>{entry.user?.name}</span>
                        ))
                      ) : (
                        <span>{firstEntry.user?.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground ">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap ">
                      {(() => {
                        const minutesAgo = Math.floor(
                          (Date.now() - firstEntry.joinedAt.getTime()) / 60000,
                        );
                        if (minutesAgo < 0) return "Just now";
                        if (minutesAgo === 0) return "Just now";
                        if (minutesAgo < 60) return `${minutesAgo}m ago`;
                        const hoursAgo = Math.floor(minutesAgo / 60);
                        return `${hoursAgo}h ago`;
                      })()}
                    </span>
                  </div>
                  {((isCurrentUser && onRemove) || (isAdmin && onRemove)) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(firstEntry.id)}
                      title={
                        isAdmin ? "Admin: Remove from queue" : "Leave queue"
                      }
                      aria-label={
                        isAdmin ? "Admin: Remove from queue" : "Leave queue"
                      }
                      className="shrink-0 [&_svg]:size-5"
                    >
                      <UserX color={"red"} strokeWidth={3} aria-hidden />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
