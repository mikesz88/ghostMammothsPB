import type { EmailStatsTimeRange } from "@/lib/admin/email-stats-types";

const VALID = new Set<string>(["today", "week", "month", "all"]);

export function parseEmailStatsTimeRange(
  value: string | string[] | undefined,
): EmailStatsTimeRange {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && VALID.has(raw)) return raw as EmailStatsTimeRange;
  return "week";
}
