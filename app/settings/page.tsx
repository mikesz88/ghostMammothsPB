"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Bell,
  CreditCard,
  Crown,
  Mail,
  Calendar,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/ui/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { getUserMembership } from "@/lib/membership-helpers";
import type { UserMembershipInfo } from "@/lib/membership-helpers";

export default function SettingsPage() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<UserMembershipInfo | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      // Fetch user details from public.users
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      setUserDetails(userData);

      // Fetch membership info
      const membershipInfo = await getUserMembership(user.id);
      setMembership(membershipInfo);

      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Sign In Required
              </h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to access your settings
              </p>
              <Button asChild className="w-full">
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account, membership, and preferences
            </p>
          </div>

          {/* User Profile Card */}
          <Card className="border-border mb-6">
            <CardHeader>
              <CardTitle className="text-foreground">
                Account Information
              </CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-medium text-foreground">
                      {userDetails?.name ||
                        user.user_metadata?.name ||
                        "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium text-foreground">
                        {user.email}
                      </p>
                      {user.email_confirmed_at && (
                        <Badge variant="outline" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  {userDetails?.skill_level && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Skill Level
                      </p>
                      <Badge variant="secondary">
                        {userDetails.skill_level.charAt(0).toUpperCase() +
                          userDetails.skill_level.slice(1)}
                      </Badge>
                    </div>
                  )}
                  {userDetails?.is_admin && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Role</p>
                      <Badge variant="default">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Member Since
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-foreground">
                        {new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Status Card */}
          {membership && (
            <Card className="border-border mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">
                      Membership Status
                    </CardTitle>
                    <CardDescription>
                      Your current subscription plan
                    </CardDescription>
                  </div>
                  {membership.isPaid ? (
                    <Badge variant="default">
                      <Crown className="w-3 h-3 mr-1" />
                      {membership.tierDisplayName}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      {membership.tierDisplayName}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">
                      Current Plan
                    </p>
                    <p className="font-medium text-foreground">
                      {membership.tierDisplayName}
                      {membership.isPaid &&
                        ` - ${new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(membership.tierPrice)}/${
                          membership.tierBillingPeriod
                        }`}
                    </p>
                    {membership.isPaid && membership.currentPeriodEnd && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {membership.cancelAtPeriodEnd
                          ? `Cancels on ${membership.currentPeriodEnd.toLocaleDateString()}`
                          : `Renews on ${membership.currentPeriodEnd.toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/settings/membership">
                      Manage Membership
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Navigation */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Settings & Preferences
            </h2>

            {/* Membership Settings */}
            <Link href="/settings/membership">
              <Card className="border-border hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          Membership & Billing
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Manage your subscription, billing, and payment methods
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Notification Settings */}
            <Link href="/settings/notifications">
              <Card className="border-border hover:border-primary transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Bell className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          Notifications
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Configure alerts for queue updates and court
                          assignments
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Actions */}
          <Card className="border-border mt-6">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/events">
                  <Calendar className="w-4 h-4 mr-2" />
                  Browse Events
                </Link>
              </Button>
              {!membership?.isPaid && (
                <Button
                  variant="default"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/membership">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Membership
                  </Link>
                </Button>
              )}
              {userDetails?.is_admin && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
