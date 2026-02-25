"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Shield,
  ShieldOff,
  Trash2,
  Loader2,
  Calendar,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  getUserById,
  updateUser,
  toggleAdminStatus,
  deleteUser,
} from "@/app/actions/admin-users";
import { Header } from "@/components/ui/header";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  skill_level: string;
  is_admin: boolean;
  membership_status?: string;
  created_at: string;
}

export default function AdminUserDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const { id } = params;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skill_level: "intermediate",
  });

  const fetchUser = async () => {
    setLoading(true);
    const { data, error } = await getUserById(id);

    if (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to fetch user", {
        description: error,
      });
      router.push("/admin/users");
    } else if (data) {
      setUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        skill_level: data.skill_level,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchUser depends on id only
  }, [id]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await updateUser(user.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      skill_level: formData.skill_level,
    });

    if (error) {
      toast.error("Failed to update user", {
        description: error,
      });
    } else {
      toast.success("User updated successfully!");
      await fetchUser();
    }
    setSaving(false);
  };

  const handleToggleAdmin = async () => {
    if (!user) return;

    const newStatus = !user.is_admin;
    const confirmMessage = newStatus
      ? "Grant admin access to this user?"
      : "Remove admin access from this user?";

    toast(confirmMessage, {
      description: newStatus
        ? "This user will have full admin privileges."
        : "This user will lose admin privileges.",
      action: {
        label: newStatus ? "Grant Access" : "Remove Access",
        onClick: async () => {
          const { error } = await toggleAdminStatus(user.id, newStatus);

          if (error) {
            toast.error("Failed to update admin status", {
              description: error,
            });
          } else {
            toast.success("Admin status updated successfully!");
            await fetchUser();
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleDelete = async () => {
    if (!user) return;

    toast(`Delete ${user.name}?`, {
      description: "This will remove all their data and cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          const { error } = await deleteUser(user.id);

          if (error) {
            toast.error("Failed to delete user", {
              description: error,
            });
          } else {
            toast.success("User deleted successfully!");
            router.push("/admin/users");
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          variant="admin"
          backButton={{ href: "/admin/users", label: "Back to Users" }}
        />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading user...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              User Not Found
            </h1>
            <Button asChild>
              <Link href="/admin/users">Back to Users</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="admin"
        backButton={{ href: "/admin/users", label: "Back to Users" }}
      />

      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* User Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">
                  {user.name}
                </h1>
                {user.is_admin && (
                  <Badge variant="default">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={user.is_admin ? "outline" : "default"}
                onClick={handleToggleAdmin}
              >
                {user.is_admin ? (
                  <>
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Remove Admin
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Make Admin
                  </>
                )}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Edit User Info */}
            <Card className="border-border bg-card md:col-span-2">
              <CardHeader>
                <CardTitle className="text-foreground">
                  User Information
                </CardTitle>
                <CardDescription>Update user details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skill">Skill Level</Label>
                  <Select
                    value={formData.skill_level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, skill_level: value })
                    }
                  >
                    <SelectTrigger id="skill">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* User Stats */}
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Membership
                    </p>
                    <Badge variant="secondary">
                      {user.membership_status || "Free"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Skill Level
                    </p>
                    <Badge variant="outline">{user.skill_level}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Member Since
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg">
                    Activity Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Events Attended
                      </span>
                    </div>
                    <span className="font-medium text-foreground">
                      Coming soon
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Games Played
                      </span>
                    </div>
                    <span className="font-medium text-foreground">
                      Coming soon
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription>
                Queue entries and event participation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Activity tracking coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
