import { Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";

export default function CalendarPage() {
  // Google Calendar embed URL (from Calendar > Settings > Integrate calendar)
  const calendarEmbedUrl =
    "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America/Chicago&showPrint=0&src=Z2hvc3RtYW1tb3RoZGV2QGdtYWlsLmNvbQ&src=ZW4udXNhI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%23039be5&color=%230b8043";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">
                Event Calendar
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              View all upcoming Ghost Mammoth Pickleball events
            </p>
          </div>

          {/* Calendar Embed */}
          <Card className="border-border">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-foreground">Upcoming Events</CardTitle>
                <CardDescription>
                  All scheduled pickleball events and sessions
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                <a
                  href={calendarEmbedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open in Google Calendar (opens in new window)"
                >
                  <ExternalLink className="w-4 h-4 mr-2" aria-hidden />
                  Open in Google Calendar
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="w-full min-h-[70vh] sm:min-h-[600px] rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={calendarEmbedUrl}
                  style={{ border: 0 }}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  title="Ghost Mammoth Pickleball Calendar"
                  className="w-full h-full min-h-[70vh] sm:min-h-[600px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
