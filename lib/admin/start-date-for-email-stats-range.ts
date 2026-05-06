import type { EmailStatsTimeRange } from "@/lib/admin/email-stats-types";

export function startDateForEmailStatsRange(
  timeRange: EmailStatsTimeRange,
): Date {
  if (timeRange === "all") return new Date(0);
  const dateFilter = new Date();
  switch (timeRange) {
    case "today":
      dateFilter.setHours(0, 0, 0, 0);
      break;
    case "week":
      dateFilter.setDate(dateFilter.getDate() - 7);
      break;
    case "month":
      dateFilter.setMonth(dateFilter.getMonth() - 1);
      break;
    default:
      break;
  }
  return dateFilter;
}
