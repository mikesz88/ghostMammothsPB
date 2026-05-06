import type { NotificationType } from "@/lib/use-notifications";

type NotifyPosition = (
  type: NotificationType,
  title: string,
  options: NotificationOptions,
) => void;

export function sendQueuePositionBumpNotification(
  userPosition: number,
  sendNotification: NotifyPosition,
): void {
  if (userPosition <= 4) {
    sendNotification("up-next", "Almost Your Turn!", {
      body: `You're now #${userPosition} in the queue. Get ready to play!`,
      tag: "queue-position",
    });
    return;
  }
  sendNotification("position-change", "Queue Position Updated", {
    body: `You moved up to position #${userPosition}`,
    tag: "queue-position",
  });
}
