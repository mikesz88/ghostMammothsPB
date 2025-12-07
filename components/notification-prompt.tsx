"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Bell, X } from "lucide-react"
import { useNotifications } from "@/lib/use-notifications"

export function NotificationPrompt() {
  const { permission, requestPermission, isSupported } = useNotifications()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const wasDismissed = localStorage.getItem("notification-prompt-dismissed")
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem("notification-prompt-dismissed", "true")
  }

  const handleEnable = async () => {
    const result = await requestPermission()
    if (result === "granted") {
      setDismissed(true)
    }
  }

  if (!isSupported || permission === "granted" || permission === "denied" || dismissed) {
    return null
  }

  return (
    <Alert className="border-primary bg-primary/10">
      <Bell className="w-4 h-4 text-primary" />
      <AlertTitle className="text-foreground flex items-center justify-between">
        Enable Notifications
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-6 w-6">
          <X className="w-4 h-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>Get notified when it's your turn to play</span>
        <Button size="sm" onClick={handleEnable} className="ml-4">
          Enable
        </Button>
      </AlertDescription>
    </Alert>
  )
}
