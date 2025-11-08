"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Shield, Loader2, Crown } from "lucide-react";
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
import type { Database } from "@/supabase/supa-schema";
import { toast } from "sonner";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [userDetails, setUserDetails] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  const performDeleteAccount = async () => {
    try {
      setDeleteLoading(true);

      const response = await fetch("/api/account", {
        method: "DELETE",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.error || "Failed to delete account. Please contact support."
        );
      }

      toast.success("Your account has been deleted.");
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error(
        "We couldn't delete your account. Please try again or contact support."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteLoading) {
      return;
    }

    const deleteToastId = toast.warning("Delete your account?", {
      description:
        "This will cancel any active memberships and permanently remove your data.",
      duration: Infinity,
      action: {
        label: "Delete",
        onClick: () => {
          toast.dismiss(deleteToastId);
          void performDeleteAccount();
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast.dismiss(deleteToastId);
        },
      },
    });
  };

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
                <Link href="/settings/membership">
                  <Crown className="w-4 h-4 mr-2" />
                  Manage Membership
                </Link>
              </Button>
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

          {/* Account Controls */}
          <Card className="border-border mt-6">
            <CardHeader>
              <CardTitle className="text-foreground">
                Account Controls
              </CardTitle>
              <CardDescription>
                Manage the status of your account and data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Deleting your account will immediately cancel access, remove
                your profile from events, and permanently erase your membership
                history.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="w-full sm:w-auto"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting account...
                  </>
                ) : (
                  "Delete account"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
