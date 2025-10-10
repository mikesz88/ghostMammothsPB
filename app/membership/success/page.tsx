"use client";

import Link from "next/link";
import { Check, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/ui/header";

export default function MembershipSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto border-primary">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">
              Welcome to Monthly Membership!
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Your subscription is now active. You have unlimited access to all
              events!
            </p>

            <div className="bg-primary/5 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-primary" />
                <p className="font-semibold text-foreground">
                  Your Monthly Benefits
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Free entry to ALL events
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Priority queue position
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Exclusive events access
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  10% merchandise discount
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/settings/membership">Manage Membership</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              You'll receive a confirmation email with your receipt shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
