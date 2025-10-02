import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, Trophy } from "lucide-react"

interface QueuePositionAlertProps {
  position: number
  isUpNext: boolean
}

export function QueuePositionAlert({ position, isUpNext }: QueuePositionAlertProps) {
  if (isUpNext) {
    return (
      <Alert className="border-primary bg-primary/10">
        <Trophy className="w-4 h-4 text-primary" />
        <AlertTitle className="text-primary">You're Up Next!</AlertTitle>
        <AlertDescription>Get ready to play. You'll be assigned to a court shortly.</AlertDescription>
      </Alert>
    )
  }

  if (position <= 4) {
    return (
      <Alert className="border-primary/50 bg-primary/5">
        <Bell className="w-4 h-4 text-primary" />
        <AlertTitle className="text-foreground">Almost Your Turn</AlertTitle>
        <AlertDescription>You're #{position} in queue. Stay nearby and get ready to play!</AlertDescription>
      </Alert>
    )
  }

  return null
}
