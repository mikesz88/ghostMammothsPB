import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Trophy, Users } from "lucide-react";

interface QueuePositionAlertProps {
  position: number;
  isUpNext: boolean;
  /** Solo is in line but not yet in the assignable pool until another solo joins (or mix changes). */
  isPendingSolo?: boolean;
}

export function QueuePositionAlert({
  position,
  isUpNext,
  isPendingSolo = false,
}: QueuePositionAlertProps) {
  if (isPendingSolo) {
    return (
      <Alert className="border-dashed border-sky-500/50 bg-sky-500/5">
        <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        <AlertTitle className="text-foreground">Waiting for more solo players</AlertTitle>
        <AlertDescription>
          You&apos;re #{position} in line. Another solo player needs to join before you
          can rotate into games with the current mix of pairs, or join with a partner
          as a duo. An event host can help balance the line.
        </AlertDescription>
      </Alert>
    );
  }

  if (isUpNext) {
    return (
      <Alert className="border-primary bg-primary/10">
        <Trophy className="w-4 h-4 text-primary" />
        <AlertTitle className="text-primary">You&apos;re Up Next!</AlertTitle>
        <AlertDescription>
          Get ready to play. You&apos;ll be assigned to a court shortly.
        </AlertDescription>
      </Alert>
    );
  }

  if (position <= 4) {
    return (
      <Alert className="border-primary/50 bg-primary/5">
        <Bell className="w-4 h-4 text-primary" />
        <AlertTitle className="text-foreground">Almost Your Turn</AlertTitle>
        <AlertDescription>
          You&apos;re #{position} in queue. Stay nearby and get ready to play!
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
