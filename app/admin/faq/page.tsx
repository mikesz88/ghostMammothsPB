import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/ui/header/site-header";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Host help | Admin",
  description:
    "How to run events: end game, assign next, queue management, and rotation modes.",
};

export default async function AdminFaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        variant="admin"
        backButton={{ href: "/admin", label: "Back to Dashboard" }}
      />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <p className="text-sm text-muted-foreground mb-4">
          <Link href="/faq" className="text-primary hover:underline">
            Player-facing: How queuing works →
          </Link>
        </p>
        <h1 className="text-4xl font-bold text-foreground mb-3 text-balance">
          Host help
        </h1>
        <p className="text-lg text-muted-foreground mb-10 text-pretty">
          Quick reference for running events in the admin console—court flow,
          queue, and rotation behavior.
        </p>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Typical flow</CardTitle>
              <CardDescription>
                Open an event from the dashboard, then work from the event
                console.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">1. Players join</strong> from
                the public event page (or QR/link you share). They appear in the{" "}
                <strong className="text-foreground">queue</strong> with position
                and status.
              </p>
              <p>
                <strong className="text-foreground">2. Start games</strong> with{" "}
                <strong className="text-foreground">Assign next</strong> when a
                court is free. The system pulls from the queue (and any{" "}
                <strong className="text-foreground">on-deck / pending</strong>{" "}
                winners, depending on rotation).
              </p>
              <p>
                <strong className="text-foreground">3. End a game</strong> from{" "}
                <strong className="text-foreground">Court status</strong> by
                choosing the winning side. That updates who stays, who returns
                to the queue, and—where applicable—who is listed as on deck for
                the next game on that court.
              </p>
              <p>
                <strong className="text-foreground">4. Repeat</strong>{" "}
                <strong className="text-foreground">Assign next</strong> as courts
                open up.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Rotation modes</CardTitle>
              <CardDescription>
                Set on the event; drives end-game and assign behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Rotate all</strong> — After a
                game, everyone from that game is re-queued; full rotation.
              </p>
              <p>
                <strong className="text-foreground">Winners stay</strong> —
                Winners remain for the next game on that court; losers go to the
                queue. Use <strong className="text-foreground">Assign next</strong>{" "}
                to fill open spots from the line.
              </p>
              <p>
                <strong className="text-foreground">2 Stay 2 Off</strong> —
                Doubles with <strong className="text-foreground">solo queue joins only</strong>{" "}
                (no duo/group in line). After a game, two winners stay but are
                split to opposite sides next round; two slots come from the queue.
                If someone on deck leaves, you can still{" "}
                <strong className="text-foreground">Assign next</strong>—the
                system fills remaining slots from the queue.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Queue management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Players can <strong className="text-foreground">leave</strong>{" "}
                their own row. You can{" "}
                <strong className="text-foreground">remove anyone</strong> from
                the queue if you need to fix the line or handle no-shows.
              </p>
              <p>
                Use <strong className="text-foreground">Clear queue</strong> or
                end-event flows only when you intentionally reset the session—
                those actions remove waiting players and related state.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Sharing the event</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Use <strong className="text-foreground">Show queue QR</strong>{" "}
                (or the public event URL) so players can open the event and join
                from their phones without admin access.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
