"use client";

import { useEffect, useState } from "react";

import { sendQueuePositionBumpNotification } from "@/lib/hooks/queue-position-notify-logic";

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
      sendQueuePositionBumpNotification(userPosition, sendNotification);
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
