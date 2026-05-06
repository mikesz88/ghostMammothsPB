/** Returns cleanup, or undefined when polling disabled. */
export function scheduleRealtimeQueuePoll(
  pollMs: number,
  fetchQueue: () => Promise<void>,
): (() => void) | undefined {
  if (pollMs <= 0) return undefined;
  const id = setInterval(() => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }
    void fetchQueue();
  }, pollMs);
  return () => clearInterval(id);
}
