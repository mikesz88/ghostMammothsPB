import { ExternalLink } from "lucide-react";
import Link from "next/link";

import type { EmailLogRow } from "@/lib/admin/email-stats-types";

export function FailedSendEventCell({ log }: { log: EmailLogRow }) {
  return (
    <td className="p-3">
      {log.event_id ? (
        <Link
          href={`/admin/events/${log.event_id}`}
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          {log.event?.name ?? "Event"}
          <ExternalLink className="w-3 h-3 shrink-0" />
        </Link>
      ) : (
        "—"
      )}
    </td>
  );
}
