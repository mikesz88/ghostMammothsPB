"use client"

import { useState } from "react"
import Link from "next/link"
import { Trophy, ArrowLeft, Bell, Mail, MessageSquare, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useNotifications } from "@/lib/use-notifications"

export default function NotificationSettingsPage() {
  const { permission, requestPermission } = useNotifications()
  const [settings, setSettings] = useState({
    browserNotifications: permission === "granted",
    emailNotifications: true,
    smsNotifications: false,
    notifyOnQueueJoin: true,
    notifyOnPositionChange: true,
    notifyOnUpNext: true,
    notifyOnCourtAssignment: true,
    notifyOnGameStart: true,
    email: "user@example.com",
    phone: "",
  })

  const handleToggle = (key: keyof typeof settings) => {
    if (key === "browserNotifications" && !settings.browserNotifications) {
      requestPermission().then((result) => {
        setSettings({ ...settings, browserNotifications: result === "granted" })
      })
    } else {
      setSettings({ ...settings, [key]: !settings[key] })
    }
  }

  const handleInputChange = (key: keyof typeof settings, value: string) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleSave = () => {
    // In a real app, this would save to the database
    alert("Notification settings saved!")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Ghost Mammoths PB</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">Manage how you receive updates about your queue status</p>
        </div>

        <div className="space-y-6">
          {/* Notification Channels */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Notification Channels</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="browser" className="text-foreground font-medium">
                      Browser Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Get instant alerts in your browser</p>
                  </div>
                </div>
                <Switch
                  id="browser"
                  checked={settings.browserNotifications}
                  onCheckedChange={() => handleToggle("browserNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <Switch
                  id="email"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggle("emailNotifications")}
                />
              </div>

              {settings.emailNotifications && (
                <div className="ml-13 space-y-2">
                  <Label htmlFor="email-input" className="text-sm text-muted-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email-input"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="sms" className="text-foreground font-medium">
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Get text messages for important updates</p>
                  </div>
                </div>
                <Switch
                  id="sms"
                  checked={settings.smsNotifications}
                  onCheckedChange={() => handleToggle("smsNotifications")}
                />
              </div>

              {settings.smsNotifications && (
                <div className="ml-13 space-y-2">
                  <Label htmlFor="phone-input" className="text-sm text-muted-foreground">
                    Phone Number
                  </Label>
                  <Input
                    id="phone-input"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Notification Types</CardTitle>
              <CardDescription>Choose which events trigger notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="queue-join" className="text-foreground font-medium">
                    Queue Joined
                  </Label>
                  <p className="text-sm text-muted-foreground">When you successfully join a queue</p>
                </div>
                <Switch
                  id="queue-join"
                  checked={settings.notifyOnQueueJoin}
                  onCheckedChange={() => handleToggle("notifyOnQueueJoin")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="position-change" className="text-foreground font-medium">
                    Position Changes
                  </Label>
                  <p className="text-sm text-muted-foreground">When you move up in the queue</p>
                </div>
                <Switch
                  id="position-change"
                  checked={settings.notifyOnPositionChange}
                  onCheckedChange={() => handleToggle("notifyOnPositionChange")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="up-next" className="text-foreground font-medium">
                    Up Next Alert
                  </Label>
                  <p className="text-sm text-muted-foreground">When you're in the top 4 of the queue</p>
                </div>
                <Switch
                  id="up-next"
                  checked={settings.notifyOnUpNext}
                  onCheckedChange={() => handleToggle("notifyOnUpNext")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="court-assignment" className="text-foreground font-medium">
                    Court Assignment
                  </Label>
                  <p className="text-sm text-muted-foreground">When you're assigned to a court</p>
                </div>
                <Switch
                  id="court-assignment"
                  checked={settings.notifyOnCourtAssignment}
                  onCheckedChange={() => handleToggle("notifyOnCourtAssignment")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="game-start" className="text-foreground font-medium">
                    Game Starting Soon
                  </Label>
                  <p className="text-sm text-muted-foreground">5 minutes before your game starts</p>
                </div>
                <Switch
                  id="game-start"
                  checked={settings.notifyOnGameStart}
                  onCheckedChange={() => handleToggle("notifyOnGameStart")}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} size="lg" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
