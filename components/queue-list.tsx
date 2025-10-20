"use client";

import { Clock, X } from "lucide-react";
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

export function QueueList({
  queue,
  onRemove,
  currentUserId,
  isAdmin = false,
}: QueueListProps) {
  const waitingQueue = queue
    .filter((entry) => entry.status === "waiting")
    .sort((a, b) => a.position - b.position);

  const groupedQueue: (QueueEntry | QueueEntry[])[] = [];
  const processedGroups = new Set<string>();

  for (const entry of waitingQueue) {
    if (entry.groupId && !processedGroups.has(entry.groupId)) {
      const groupMembers = waitingQueue.filter(
        (e) => e.groupId === entry.groupId
      );
      groupedQueue.push(groupMembers);
      processedGroups.add(entry.groupId);
    } else if (!entry.groupId) {
      groupedQueue.push(entry);
    }
  }

  if (waitingQueue.length === 0) {
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
      {groupedQueue.map((item, index) => {
        const isGroup = Array.isArray(item);
        const entries = isGroup ? item : [item];
        const firstEntry = entries[0];
        const isCurrentUser = entries.some((e) => e.userId === currentUserId);

        return (
          <Card
            key={isGroup ? firstEntry.groupId : firstEntry.id}
            className={`border-border bg-card hover:border-primary/50 transition-colors ${
              isCurrentUser ? "ring-2 ring-primary" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      #{firstEntry.position}
                    </span>
                  </div>
                  <div className="flex-1">
                    {isGroup ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">
                            Group of {firstEntry.groupSize || entries.length}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {firstEntry.user?.skillLevel}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {firstEntry.player_names &&
                          firstEntry.player_names.length > 0
                            ? firstEntry.player_names.map((player, idx) => (
                                <span key={idx}>{player.name}</span>
                              ))
                            : entries.map((entry) => (
                                <span key={entry.id}>{entry.user?.name}</span>
                              ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-foreground">
                          {firstEntry.user?.name}
                        </p>
                        <div className="text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {firstEntry.user?.skillLevel}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      {(() => {
                        const minutesAgo = Math.floor(
                          (Date.now() - firstEntry.joinedAt.getTime()) / 60000
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
                    >
                      <X className="w-4 h-4" />
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
