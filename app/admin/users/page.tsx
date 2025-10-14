"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Shield,
  ShieldOff,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  UserPlus,
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
import { Badge } from "@/components/ui/badge";
import {
  getAllUsers,
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.skill_level.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await getAllUsers();

    if (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users", {
        description: error,
      });
    } else {
      setUsers(data || []);
      setFilteredUsers(data || []);
    }
    setLoading(false);
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
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
          const { error } = await toggleAdminStatus(userId, newStatus);

          if (error) {
            toast.error("Failed to update admin status", {
              description: error,
            });
          } else {
            toast.success("Admin status updated successfully!");
            await fetchUsers();
          }
        },
      },
      cancel: {
        label: "Cancel",
      },
    });
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    toast(`Delete ${userName}?`, {
      description:
        "This will remove all their queue entries and cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          const { error } = await deleteUser(userId);

          if (error) {
            toast.error("Failed to delete user", {
              description: error,
            });
          } else {
            toast.success("User deleted successfully!");
            await fetchUsers();
          }
        },
      },
      cancel: {
        label: "Cancel",
      },
    });
  };

  const adminUsers = filteredUsers.filter((u) => u.is_admin);
  const regularUsers = filteredUsers.filter((u) => !u.is_admin);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />

      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage users and admin permissions
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {users.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Admins</p>
                  <p className="text-3xl font-bold text-foreground">
                    {adminUsers.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Regular Users
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {regularUsers.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Free Members
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {
                      users.filter(
                        (u) =>
                          u.membership_status === "free" || !u.membership_status
                      ).length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, or skill level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Admins Section */}
        {adminUsers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Administrators ({adminUsers.length})
            </h2>
            <div className="space-y-3">
              {adminUsers.map((user) => (
                <Card key={user.id} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground">
                              {user.name}
                            </p>
                            <Badge variant="default" className="text-xs">
                              Admin
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {user.skill_level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-muted-foreground">
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleAdmin(user.id, user.is_admin)
                          }
                        >
                          <ShieldOff className="w-4 h-4 mr-2" />
                          Remove Admin
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Users Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Regular Users ({regularUsers.length})
          </h2>
          {regularUsers.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No users found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {regularUsers.map((user) => (
                <Card key={user.id} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-foreground">
                              {user.name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {user.skill_level}
                            </Badge>
                            {user.membership_status &&
                              user.membership_status !== "free" && (
                                <Badge variant="secondary" className="text-xs">
                                  {user.membership_status}
                                </Badge>
                              )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-muted-foreground">
                              {user.phone}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined{" "}
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleAdmin(user.id, user.is_admin)
                          }
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Make Admin
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
