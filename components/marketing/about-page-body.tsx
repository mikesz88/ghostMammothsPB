import {
  Trophy,
  Users,
  Zap,
  Calendar,
  Shield,
  Heart,
} from "lucide-react";

import { AboutPageCtaClient } from "@/components/marketing/about-page-cta-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { HeaderServerSnapshot } from "@/components/ui/header/header-client";

type AboutPageBodyProps = {
  serverSnapshot: HeaderServerSnapshot | null;
};

export function AboutPageBody({ serverSnapshot }: AboutPageBodyProps) {
  return (
    <>
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
            About Ghost Mammoth Pickleball
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            To grow the culture of pickleball through social connection,
            creativity, and community- turning everyday play into unforgettable
            experiences
          </p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-border bg-card text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-foreground">Community First</CardTitle>
              <CardDescription>
                Building a welcoming community where players of all skill levels
                can enjoy the game together
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-foreground">Fair Play</CardTitle>
              <CardDescription>
                Ensuring everyone gets equal court time with transparent queue
                management and rotation systems
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-foreground">Innovation</CardTitle>
              <CardDescription>
                Using technology to streamline event management and enhance the
                player experience
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            How It Works
          </h2>
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="text-foreground mb-2">
                      Browse Events
                    </CardTitle>
                    <CardDescription>
                      Check out upcoming pickleball events in your area. See
                      court availability, rotation types, and current queue
                      status in real-time.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="text-foreground mb-2">
                      Join the Queue
                    </CardTitle>
                    <CardDescription>
                      Add yourself to the queue as a solo player or bring your
                      friends as a group. Our system supports duos, triples,
                      and full quads.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="text-foreground mb-2">
                      Play & Rotate
                    </CardTitle>
                    <CardDescription>
                      Get notified when it&apos;s your turn. After your game,
                      the system automatically handles rotation based on the
                      event rules — rotate all, winners stay, or 2 Stay 2 Off
                      (doubles with a solo queue).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-primary" aria-hidden />
                  </div>
                  <div>
                    <CardTitle className="text-foreground mb-2">
                      Real-time Updates
                    </CardTitle>
                    <CardDescription>
                      Track your position in the queue and see estimated wait
                      times. Get notifications when you&apos;re up next so you
                      never miss your turn.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-20">
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center">
            <AboutPageCtaClient serverSnapshot={serverSnapshot} />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
