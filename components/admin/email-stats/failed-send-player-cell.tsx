import type { EmailLogRow } from "@/lib/admin/email-stats-types";

export function FailedSendPlayerCell({ log }: { log: EmailLogRow }) {
  return (
    <td className="p-3">
      <div className="font-medium text-foreground">{log.user?.name ?? "—"}</div>
      <div className="text-muted-foreground text-xs truncate max-w-[200px]">
        {log.user?.email ?? "—"}
      </div>
    </td>
  );
}
