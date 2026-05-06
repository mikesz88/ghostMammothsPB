import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EmailStatsFailedSendsHeader() {
  return (
    <CardHeader>
      <CardTitle>Failed sends</CardTitle>
      <CardDescription>
        Resend send failures after automatic retries (network, TLS, rate limits,
        etc.). Rows where we never attempted delivery—missing account email,
        missing event, invalid data—are excluded. Resend uses the player&apos;s
        current queue position or active court when you resend.
      </CardDescription>
    </CardHeader>
  );
}
