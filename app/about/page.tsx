"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Trophy, Users, Zap, Calendar, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

export default function AboutPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const supabase = createClient();
        const { data } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        setIsAdmin(data?.is_admin || false);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
            About Ghost Mammoth Pickleball
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            We're passionate about making pickleball more accessible and
            organized for everyone. Our smart queue management system ensures
            fair play and maximum court time for all players.
          </p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-border bg-card text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
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
                <Shield className="w-8 h-8 text-primary" />
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
                <Zap className="w-8 h-8 text-primary" />
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
                    <Calendar className="w-6 h-6 text-primary" />
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
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground mb-2">
                      Join the Queue
                    </CardTitle>
                    <CardDescription>
                      Add yourself to the queue as a solo player or bring your
                      friends as a group. Our system supports duos, triples, and
                      full quads.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground mb-2">
                      Play & Rotate
                    </CardTitle>
                    <CardDescription>
                      Get notified when it's your turn. After your game, the
                      system automatically handles rotation based on the event
                      rules - whether it's winners stay, rotate all, or
                      2-stay-4-off.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground mb-2">
                      Real-time Updates
                    </CardTitle>
                    <CardDescription>
                      Track your position in the queue and see estimated wait
                      times. Get notifications when you're up next so you never
                      miss your turn.
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
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Play?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join our community and experience hassle-free pickleball queue
              management
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
              {isAdmin && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/admin">Event Organizers</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground">
              &copy; 2025 Ghost Mammoth Pickleball. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/events"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Events
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
