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
    "https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID%40group.calendar.google.com&ctz=America%2FLos_Angeles";

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

          {/* Setup Alert */}
          <Alert className="mb-6">
            <CalendarIcon className="w-4 h-4" />
            <AlertDescription>
              <strong>Setup Instructions:</strong> Replace the calendar embed
              URL in{" "}
              <code className="bg-muted px-1 py-0.5 rounded">
                app/calendar/page.tsx
              </code>{" "}
              with your actual Google Calendar public embed link.
            </AlertDescription>
          </Alert>

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

          {/* Instructions Card */}
          <Card className="border-border mt-6">
            <CardHeader>
              <CardTitle className="text-foreground">
                How to Get Your Calendar Embed Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  Go to{" "}
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Calendar
                  </a>
                </li>
                <li>Click Settings (gear icon) → Settings</li>
                <li>
                  Select your calendar from the left sidebar (under "Settings
                  for my calendars")
                </li>
                <li>Scroll down to "Integrate calendar"</li>
                <li>
                  Under "Embed code", click "Customize" to adjust size and
                  appearance
                </li>
                <li>
                  Copy the{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">src</code> URL
                  from the iframe code
                </li>
                <li>
                  Replace{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    calendarEmbedUrl
                  </code>{" "}
                  in{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    app/calendar/page.tsx
                  </code>
                </li>
              </ol>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium text-foreground mb-2">
                  Make sure your calendar is set to public:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Settings → Access permissions</li>
                  <li>Check "Make available to public"</li>
                  <li>Set to "See all event details"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
