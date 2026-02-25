"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Users, Calendar, Trophy, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/ui/header";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

function HomeContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminError, setShowAdminError] = useState(false);

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

  useEffect(() => {
    if (searchParams.get("error") === "admin-access-required") {
      queueMicrotask(() => {
        setShowAdminError(true);
        setTimeout(() => setShowAdminError(false), 5000);
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        {showAdminError && (
          <div className="max-w-2xl mx-auto mb-6">
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Admin access required. You don&apos;t have permission to access
                the admin dashboard.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
          Smart Queue Management for Pickleball Events
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          Join the queue, track your position, and get notified when it&apos;s
          your turn to play. Real-time court assignments and seamless rotation
          management.
        </p>
        <div className="flex items-center justify-center gap-4">
          {user ? (
            <>
              <Button size="lg" asChild>
                <Link href="/events">View Events</Link>
              </Button>
              {isAdmin && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/admin">Admin Dashboard</Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link href="/signup">Sign Up to Join Events</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Features</h2>
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

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="mb-2">&copy; 2026 Ghost Mammoth Pickleball. All rights reserved.</p>
          <p>
            <Link href="/sitemap" className="text-primary hover:underline">
              Sitemap
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
