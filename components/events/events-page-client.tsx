"use client";

import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useRealtimeEvents } from "@/lib/hooks/use-realtime-events";
import { createClient } from "@/lib/supabase/client";

import type { HeaderServerSnapshot } from "@/components/ui/header/header-client";
import type { EventDetailSerializedEvent } from "@/lib/events/event-detail-server";

type EventsPageClientProps = {
  initialSerializedEvents: EventDetailSerializedEvent[];
  serverSnapshot?: HeaderServerSnapshot | null;
};

export function EventsPageClient({
  initialSerializedEvents,
  serverSnapshot,
}: EventsPageClientProps) {
  const { events, loading } = useRealtimeEvents(initialSerializedEvents);
  const { user } = useAuth();
  const [clientAdmin, setClientAdmin] = useState<{
    userId: string;
    value: boolean;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    if (serverSnapshot && user.id === serverSnapshot.userId) return;
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (!cancelled)
        setClientAdmin({
          userId: user.id,
          value: data?.is_admin ?? false,
        });
    })();
    return () => {
      cancelled = true;
    };
  }, [user, serverSnapshot]);

  let isAdmin = false;
  if (user) {
    if (serverSnapshot?.userId === user.id) {
      isAdmin = serverSnapshot.isAdmin;
    } else if (clientAdmin?.userId === user.id) {
      isAdmin = clientAdmin.value;
    }
  }

  return (
    <>
      <h1 className="sr-only">Events</h1>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Upcoming Events
          </h1>
          <p className="text-muted-foreground">
            Join the queue for your favorite pickleball events
          </p>

          {!user && (
            <div className="mt-6 p-4 bg-muted border border-border rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    Ready to join the action?
                  </h2>
                  <p className="text-foreground text-base">
                    Sign up to join event queues and start playing!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              className="w-8 h-8 animate-spin text-muted-foreground"
              aria-hidden
            />
            <span className="ml-2 text-muted-foreground">
              Loading events...
            </span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Events Available
            </h2>
            <p className="text-muted-foreground mb-4">
              Check back later for upcoming pickleball events.
            </p>
            {user && isAdmin && (
              <Button asChild>
                <Link href="/admin">Create Event</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card
                key={event.id}
                className="border-border bg-card hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-foreground text-lg">
                      {event.name}
                    </CardTitle>
                    <Badge variant="default" className="text-sm">
                      {event.status}
                    </Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString()} at{" "}
                      {new Date(event.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.teamSize === 1
                            ? "Solo (1v1)"
                            : event.teamSize === 2
                              ? "Doubles (2v2)"
                              : event.teamSize === 3
                                ? "Triplets (3v3)"
                                : "Quads (4v4)"}{" "}
                          • {event.courtCount} courts
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span>
                          {event.rotationType
                            .replace("-", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/events/${event.id}`}>
                      View Event
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
