/**
 * Pure helpers for interpreting `email_logs` rows (not a Server Actions file).
 */

export function isActionableDeliveryFailure(log: {
  success: boolean;
  error_message: string | null;
}): boolean {
  if (log.success) return false;
  const msg = (log.error_message ?? "").trim();
  const notDelivery = [
    "User email not found",
    "Event not found",
    "Court number is required",
    "Invalid notification type",
  ];
  if (notDelivery.some((s) => msg === s || msg.startsWith(s))) return false;
  return true;
}
