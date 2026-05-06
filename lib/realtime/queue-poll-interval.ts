/**
 * Polling fallback when `postgres_changes` does not reach all clients (e.g. strict per-row RLS).
 * Set `NEXT_PUBLIC_QUEUE_POLL_INTERVAL_MS=0` to disable. Default: 10000.
 */
export function queuePollIntervalMs(): number {
  const raw = process.env.NEXT_PUBLIC_QUEUE_POLL_INTERVAL_MS;
  if (raw === "0" || raw === "") return 0;
  const n = Number.parseInt(raw ?? "", 10);
  if (Number.isFinite(n) && n > 0) return n;
  return 10_000;
}
