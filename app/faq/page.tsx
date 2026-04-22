import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/ui/header";

export const metadata: Metadata = {
  title: "How queuing works | Ghost Mammoth PB",
  description:
    "How to join the queue, team size vs group size, rotation modes, and what happens after a game.",
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <p className="text-sm text-muted-foreground mb-4">
          <Link href="/events" className="text-primary hover:underline">
            ← Back to events
          </Link>
        </p>
        <h1 className="text-4xl font-bold text-foreground mb-3 text-balance">
          How queuing works
        </h1>
        <p className="text-lg text-muted-foreground mb-10 text-pretty">
          Quick answers for players joining an event—what the numbers mean, how
          you get on a court, and how rotation modes behave.
        </p>

        <div className="space-y-6" id="how-to-queue">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                Getting in line
              </CardTitle>
              <CardDescription>
                From an event page, use{" "}
                <strong className="text-foreground">Join queue</strong> when you&apos;re ready
                to play.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                You can{" "}
                <strong className="text-foreground">leave the queue any time</strong> from your
                row (use the leave control on your card). If you change your mind later, join
                again when you&apos;re ready.
              </p>
              <p id="after-a-game">
                <strong className="text-foreground">After a game ends</strong>, what happens next
                depends on the host&apos;s{" "}
                <strong className="text-foreground">rotation type</strong>: you might go{" "}
                <strong className="text-foreground">back in line</strong>,{" "}
                <strong className="text-foreground">stay on the court</strong> as a winner, or show
                as <strong className="text-foreground">on deck</strong> while the next group is
                filled. Your event page updates as the host runs the event—check your badge and
                the queue list so you know where you stand.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card" id="teams-and-groups">
            <CardHeader>
              <CardTitle className="text-foreground">
                Team size vs group size
              </CardTitle>
              <CardDescription>
                Two different ideas—both get called &quot;team&quot; in conversation, which causes
                confusion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Team size (event setting)</strong> is how many
                players are on <em>each side</em> of the net for that format.{" "}
                <strong className="text-foreground">Doubles</strong> means{" "}
                <strong className="text-foreground">2 vs 2</strong> on one court (four players
                total).
              </p>
              <p>
                In everyday language, think of the two players on{" "}
                <strong className="text-foreground">one side of the court</strong> as the
                &quot;team&quot; for that side—not always the same as how you signed up in the
                queue.
              </p>
              <p>
                <strong className="text-foreground">Group size (when you join)</strong> is whether
                you enter the line as a <strong className="text-foreground">solo</strong> (one
                player) or a <strong className="text-foreground">duo</strong> (two players
                together as one group in line). Duo is especially useful for{" "}
                <strong className="text-foreground">2v2</strong> so partners stay together in the
                queue—like one pager at a restaurant: the account that joined is the{" "}
                <strong className="text-foreground">captain</strong> for app notifications; give
                your partner a heads-up when you&apos;re up.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card" id="game-modes">
            <CardHeader>
              <CardTitle className="text-foreground">Rotation modes</CardTitle>
              <CardDescription>
                The host picks the mode for the event. Here&apos;s the short version.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Rotate all</h3>
                <p>
                  After a game, players from that game go back through the queue in a fair
                  rotation. Nobody keeps the court just because they won.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Winners stay</h3>
                <p>
                  Winners stay on the court for the next game on that court. Losers return to the
                  queue; when the host assigns the next game, new players from the queue fill the
                  open spots.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">2 Stay 2 Off</h3>
                <p>
                  Built for <strong className="text-foreground">doubles</strong> with{" "}
                  <strong className="text-foreground">solo queue sign-ups only</strong>—you
                  can&apos;t join as a pre-formed duo for this mode. The app pairs solos into
                  sides; after a game, the two winners stay for the next game but are placed on{" "}
                  <strong className="text-foreground">opposite sides</strong> (they&apos;ll be
                  opponents next), and two players from the queue fill the other spots.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">
                How do I actually get on a court?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Joining the queue puts you <strong className="text-foreground">in line</strong>.
                The host uses <strong className="text-foreground">Assign next</strong> (or their
                venue flow) to move people from the queue onto an open court when it&apos;s time.
                Until then, watch the queue list and any alerts on the event page.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
