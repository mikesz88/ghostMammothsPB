import { Calendar as CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CalendarPage() {
  // Replace this with your actual Google Calendar embed URL
  // To get this: Go to Google Calendar > Settings > Integrate calendar > Copy the iframe code
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
              View all upcoming Ghost Mammoths Pickleball events
            </p>
          </div>

          {/* Calendar Embed */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Upcoming Events</CardTitle>
              <CardDescription>
                All scheduled pickleball events and sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={calendarEmbedUrl}
                  style={{ border: 0 }}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  title="Ghost Mammoths Pickleball Calendar"
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
