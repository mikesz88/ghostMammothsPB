import { inspect } from "node:util";

function tryFormatPrimitive(error: unknown): string | undefined {
  if (error == null) return "Unknown error";
  if (error instanceof Error) {
    return error.message || error.name || "Error";
  }
  if (typeof error === "string") return error;
  if (typeof error === "number" || typeof error === "boolean") {
    return String(error);
  }
  return undefined;
}

function nestedMessageFromRecord(o: Record<string, unknown>): string | null {
  if (typeof o.message === "string" && o.message.length > 0) {
    return o.message;
  }
  if (o.message != null) {
    return formatSendError(o.message);
  }
  if (typeof o.error === "string" && o.error.length > 0) {
    return o.error;
  }
  if (o.error != null) {
    return formatSendError(o.error);
  }
  return null;
}

function httpPrefixFromRecord(o: Record<string, unknown>): string {
  const name = typeof o.name === "string" ? o.name : "";
  let status: number | null = null;
  if (typeof o.statusCode === "number") {
    status = o.statusCode;
  } else if (typeof o.status === "number") {
    status = o.status;
  }
  return [name, status != null ? `HTTP ${status}` : ""]
    .filter(Boolean)
    .join(" ");
}

function formatObjectAsError(error: object): string {
  const o = error as Record<string, unknown>;
  const nested = nestedMessageFromRecord(o);
  if (nested) return nested;

  const prefix = httpPrefixFromRecord(o);
  try {
    const s = JSON.stringify(error);
    if (s !== "{}" && s !== "null") {
      return prefix ? `${prefix}: ${s}` : s;
    }
  } catch {
    /* circular or non-serializable */
  }

  const detail = inspect(error, { depth: 6, breakLength: 200 });
  return prefix ? `${prefix} ${detail}` : detail;
}

/** Serialize Resend / fetch errors without producing `[object Object]` (circular refs, odd SDK shapes). */
export function formatSendError(error: unknown): string {
  const prim = tryFormatPrimitive(error);
  if (prim !== undefined) return prim;
  if (typeof error === "object" && error !== null) {
    return formatObjectAsError(error);
  }
  return String(error);
}
