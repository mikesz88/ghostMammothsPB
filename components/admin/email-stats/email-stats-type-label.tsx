export function emailStatsTypeLabel(type: string) {
  if (type === "join") return "Queue Join Confirmations";
  if (type === "position-update") return "Position Updates";
  if (type === "up-next") return "Up Next Alerts";
  if (type === "court-assignment") return "Court Assignments";
  return "";
}
