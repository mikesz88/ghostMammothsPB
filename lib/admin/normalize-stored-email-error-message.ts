export function normalizeStoredEmailErrorMessage(stored: string | null): string | null {
  if (stored == null) return null;
  const t = stored.trim();
  if (
    t === "[object Object]" ||
    t === "Error: [object Object]" ||
    t.endsWith("[object Object]")
  ) {
    return "Legacy log: error details were not saved. New sends record readable errors; match this row to Resend by time and recipient, or use Resend.";
  }
  return stored;
}
