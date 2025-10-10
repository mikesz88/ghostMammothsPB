"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/ui/header";

export default function MembershipCancelPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-muted-foreground" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-4">
              Checkout Cancelled
            </h1>

            <p className="text-muted-foreground mb-8">
              Your membership upgrade was cancelled. No charges were made.
            </p>

            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/membership">View Membership Plans</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
