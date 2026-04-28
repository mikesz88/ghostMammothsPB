import { Users, Calendar, Trophy, Zap } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function HomePageBody() {
  return (
    <>
      <section
        className="container mx-auto px-4 py-16"
        aria-labelledby="features-heading"
      >
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-foreground">Real-time Queue</CardTitle>
              <CardDescription className="text-base">
                Join the queue and see your position update in real-time as
                games progress
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-foreground">
                Smart Assignments
              </CardTitle>
              <CardDescription className="text-base">
                Automatic court assignments with configurable rotation logic for
                fair play
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-foreground">
                Event Management
              </CardTitle>
              <CardDescription className="text-base">
                Create and manage multiple events with custom court counts and
                rules
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-primary" aria-hidden />
              </div>
              <CardTitle className="text-foreground">Group Support</CardTitle>
              <CardDescription className="text-base">
                Join as singles, duos, triples, or full quads with your friends
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to streamline your pickleball events?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Get started today and experience hassle-free queue management with
              real-time updates
            </p>
            <Button size="lg" asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
