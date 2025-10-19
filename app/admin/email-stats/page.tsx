"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { Badge } from "@/components/ui/badge";
import { getEmailStats } from "@/app/actions/notifications";

export default function EmailStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<
    "today" | "week" | "month" | "all"
  >("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    const result = await getEmailStats(timeRange);
    if (!result.error) {
      setStats(result);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          variant="admin"
          backButton={{ href: "/admin", label: "Back to Dashboard" }}
        />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span className="text-muted-foreground">
              Loading email statistics...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="admin"
        backButton={{ href: "/admin", label: "Back to Dashboard" }}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Email Statistics
            </h1>
            <p className="text-muted-foreground">
              Track email notifications for SMS cost estimation
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={timeRange === "today" ? "default" : "outline"}
            onClick={() => setTimeRange("today")}
          >
            Today
          </Button>
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            onClick={() => setTimeRange("week")}
          >
            Last 7 Days
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            onClick={() => setTimeRange("month")}
          >
            Last 30 Days
          </Button>
          <Button
            variant={timeRange === "all" ? "default" : "outline"}
            onClick={() => setTimeRange("all")}
          >
            All Time
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Emails
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.total || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Successful
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats?.successful || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Failed</p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats?.failed || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Types Breakdown */}
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle>Email Breakdown by Type</CardTitle>
            <CardDescription>
              Understand which notifications are sent most
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.byType || {}).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {type === "join" && "Queue Join Confirmations"}
                      {type === "position-update" && "Position Updates"}
                      {type === "up-next" && "Up Next Alerts"}
                      {type === "court-assignment" && "Court Assignments"}
                    </span>
                  </div>
                  <span className="text-lg font-bold">{count as number}</span>
                </div>
              ))}
              {Object.keys(stats?.byType || {}).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No emails sent yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SMS Cost Estimation */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>SMS Cost Estimation</CardTitle>
            <CardDescription>
              Estimated monthly SMS costs based on current email volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Typical SMS costs: $0.0075 - $0.02 per message (varies by
                provider)
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Low Estimate ($0.0075/SMS)
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ${((stats?.total || 0) * 0.0075).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    High Estimate ($0.02/SMS)
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ${((stats?.total || 0) * 0.02).toFixed(2)}
                  </p>
                </div>
              </div>
              {timeRange === "week" && stats?.total > 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Estimated monthly cost:{" "}
                  <strong>
                    ${((stats?.total || 0) * 4 * 0.0075).toFixed(2)}
                  </strong>{" "}
                  -{" "}
                  <strong>
                    ${((stats?.total || 0) * 4 * 0.02).toFixed(2)}
                  </strong>
                </p>
              )}
              {timeRange === "today" && stats?.total > 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  If this daily rate continues, estimated monthly cost:{" "}
                  <strong>
                    ${((stats?.total || 0) * 30 * 0.0075).toFixed(2)}
                  </strong>{" "}
                  -{" "}
                  <strong>
                    ${((stats?.total || 0) * 30 * 0.02).toFixed(2)}
                  </strong>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
