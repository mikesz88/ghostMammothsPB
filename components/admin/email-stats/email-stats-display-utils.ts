export function formatEmailStatsLogTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function truncateEmailStatsError(msg: string | null, max = 96) {
  if (!msg) return "—";
  return msg.length <= max ? msg : `${msg.slice(0, max)}…`;
}
