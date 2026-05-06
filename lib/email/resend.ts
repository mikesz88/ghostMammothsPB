import { Resend } from "resend";

import {
  buildCourtAssignmentMessage,
  buildPositionUpdateMessage,
  buildQueueJoinMessage,
  buildUpNextMessage,
} from "@/lib/email/templates/queue-notifications";

import type { QueueEmailData } from "@/lib/email/queue-email-data";

const resend = new Resend(process.env.RESEND_API_KEY);

const RESEND_MAX_ATTEMPTS = 4;
const RESEND_RETRY_BASE_MS = 400;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function errorFingerprint(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name} ${error.message}`;
  }
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const o = error as Record<string, unknown>;
    const parts = [
      typeof o.message === "string" ? o.message : "",
      typeof o.name === "string" ? o.name : "",
      typeof o.statusCode === "number" ? String(o.statusCode) : "",
      typeof o.status === "number" ? String(o.status) : "",
    ];
    return parts.filter(Boolean).join(" ");
  }
  return String(error);
}

/** Network / rate-limit / upstream issues — safe to retry the same API call. */
function isTransientSendError(error: unknown): boolean {
  const msg = errorFingerprint(error).toLowerCase();
  if (
    [
      "greeting never received",
      "socket disconnected",
      "tls",
      "econnreset",
      "etimedout",
      "timeout",
      "econnrefused",
      "socket hang up",
      "fetch failed",
      "network error",
      "429",
      "too many requests",
      "rate limit",
      "status code 503",
      "status code 502",
      "status code 500",
      "http 503",
      "http 502",
      "http 500",
      "bad gateway",
      "service unavailable",
      "try again",
    ].some((p) => msg.includes(p))
  ) {
    return true;
  }
  if (error && typeof error === "object") {
    const s =
      (error as { statusCode?: number }).statusCode ??
      (error as { status?: number }).status;
    if (s === 429 || s === 500 || s === 502 || s === 503) return true;
  }
  return false;
}

type ResendEmailPayload = Parameters<typeof resend.emails.send>[0];

async function sendResendEmailWithRetry(
  payload: ResendEmailPayload,
): Promise<
  { success: true; messageId?: string } | { success: false; error: unknown }
> {
  let lastError: unknown;
  for (let attempt = 0; attempt < RESEND_MAX_ATTEMPTS; attempt++) {
    try {
      const { data: result, error } = await resend.emails.send(payload);
      if (error) {
        lastError = error;
        if (isTransientSendError(error) && attempt < RESEND_MAX_ATTEMPTS - 1) {
          await sleep(RESEND_RETRY_BASE_MS * 3 ** attempt);
          continue;
        }
        return { success: false, error };
      }
      return { success: true, messageId: result?.id };
    } catch (e) {
      lastError = e;
      if (isTransientSendError(e) && attempt < RESEND_MAX_ATTEMPTS - 1) {
        await sleep(RESEND_RETRY_BASE_MS * 3 ** attempt);
        continue;
      }
      return { success: false, error: e };
    }
  }
  return { success: false, error: lastError };
}

// Resend requires verified domains or onboarding@resend.dev - Gmail/EMAIL_FROM won't work
const RESEND_DEFAULT_FROM = "Ghost Mammoth Pickleball <onboarding@resend.dev>";

function getFromEmail(): string {
  const env = (process.env.RESEND_FROM_EMAIL || "").trim();
  if (env && env.includes("@")) return env;
  return RESEND_DEFAULT_FROM;
}

async function sendQueueEmail<T extends QueueEmailData>(
  data: T,
  build: (d: T) => { subject: string; html: string; text: string },
  logLabel: string,
) {
  try {
    const { subject, html, text } = build(data);
    const out = await sendResendEmailWithRetry({
      from: getFromEmail(),
      to: data.userEmail,
      subject,
      html,
      text,
    });

    if (!out.success) {
      console.error(`Error sending ${logLabel}:`, out.error);
      return out;
    }
    return { success: true, messageId: out.messageId };
  } catch (error) {
    console.error(`Error sending ${logLabel}:`, error);
    return { success: false, error };
  }
}

export async function sendQueueJoinEmail(data: QueueEmailData) {
  return sendQueueEmail(data, buildQueueJoinMessage, "queue join email");
}

export async function sendPositionUpdateEmail(data: QueueEmailData) {
  return sendQueueEmail(data, buildPositionUpdateMessage, "position update email");
}

export async function sendUpNextEmail(data: QueueEmailData) {
  return sendQueueEmail(data, buildUpNextMessage, "up next email");
}

export async function sendCourtAssignmentEmail(data: QueueEmailData) {
  const courtNumber = data.courtNumber;
  if (courtNumber == null) {
    return { success: false, error: "Court number is required" };
  }
  const payload: QueueEmailData & { courtNumber: number } = {
    ...data,
    courtNumber,
  };
  return sendQueueEmail(payload, buildCourtAssignmentMessage, "court assignment email");
}

export type { QueueEmailData } from "@/lib/email/queue-email-data";
