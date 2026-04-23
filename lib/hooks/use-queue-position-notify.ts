"use client";

import { useEffect, useState } from "react";

import type { NotificationType } from "@/lib/use-notifications";

type NotifyPosition = (
  type: NotificationType,
  title: string,
  options: NotificationOptions,
) => void;

export function useQueuePositionNotify(
  userPosition: number,
  sendNotification: NotifyPosition,
  isPendingSolo: boolean,
  isPendingStay: boolean,
): void {
  const [lastPosition, setLastPosition] = useState(0);

  useEffect(() => {
    if (isPendingSolo || isPendingStay) return;
    if (userPosition > 0 && lastPosition > 0 && userPosition < lastPosition) {
      if (userPosition <= 4) {
        sendNotification("up-next", "Almost Your Turn!", {
          body: `You're now #${userPosition} in the queue. Get ready to play!`,
          tag: "queue-position",
        });
      } else {
        sendNotification("position-change", "Queue Position Updated", {
          body: `You moved up to position #${userPosition}`,
          tag: "queue-position",
        });
      }
    }
    if (userPosition > 0) {
      queueMicrotask(() => setLastPosition(userPosition));
    }
  }, [
    userPosition,
    lastPosition,
    sendNotification,
    isPendingSolo,
    isPendingStay,
  ]);
}
