"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/header";

// Mock data - will be replaced with real data from Supabase
const mockEvents = [
  {
    id: "1",
    name: "Saturday Morning Doubles",
    location: "Central Park Courts",
    date: new Date("2025-10-04T09:00:00"),
    courtCount: 4,
    rotationType: "2-stay-4-off" as const,
    status: "active" as const,
    queueCount: 12,
    playingCount: 16,
  },
  {
    id: "2",
    name: "Evening Mixed Play",
    location: "Riverside Recreation Center",
    date: new Date("2025-10-04T18:00:00"),
    courtCount: 3,
    rotationType: "winners-stay" as const,
    status: "active" as const,
    queueCount: 8,
    playingCount: 12,
  },
  {
    id: "3",
    name: "Sunday Tournament",
    location: "Ghost Mammoths Arena",
    date: new Date("2025-10-05T10:00:00"),
    courtCount: 6,
    rotationType: "rotate-all" as const,
    status: "active" as const,
    queueCount: 24,
    playingCount: 24,
  },
];

export default function EventsPage() {
  const [events] = useState(mockEvents);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      {/* <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Ghost Mammoths PB</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/events" className="text-foreground font-medium">
              Events
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header> */}

      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Active Events
          </h1>
          <p className="text-muted-foreground">
            Join a queue and start playing
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="border-border bg-card hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    variant={
                      event.status === "active" ? "default" : "secondary"
                    }
                  >
                    {event.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {event.courtCount} courts
                  </Badge>
                </div>
                <CardTitle className="text-foreground">{event.name}</CardTitle>
                <CardDescription className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {event.date.toLocaleDateString()} at{" "}
                    {event.date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{event.playingCount} playing</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.queueCount} in queue
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/events/${event.id}`}>
                    Join Queue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <Card className="border-border bg-card">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No active events at the moment
              </p>
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
