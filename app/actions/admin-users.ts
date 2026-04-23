"use server";

import { fetchAdminUsersList } from "@/lib/admin/fetch-admin-users-list";
import { createClient } from "@/lib/supabase/server";

export async function getAllUsers(searchQuery?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Unauthorized - Admin access required" };
  }

  const { data, error } = await fetchAdminUsersList(supabase, searchQuery);

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getUserById(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { data: null, error: "Unauthorized - Admin access required" };
  }

  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      queue_entries(count),
      event_registrations:event_registrations(count)
    `
    )
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function updateUser(
  userId: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    skill_level?: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Unauthorized - Admin access required" };
  }

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("Error updating user:", error);
    return { error: error.message };
  }

  return { error: null };
}

export async function toggleAdminStatus(userId: string, isAdmin: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Unauthorized - Admin access required" };
  }

  if (user.id === userId && !isAdmin) {
    return { error: "Cannot remove your own admin status" };
  }

  const { error } = await supabase
    .from("users")
    .update({ is_admin: isAdmin })
    .eq("id", userId);

  if (error) {
    console.error("Error toggling admin status:", error);
    return { error: error.message };
  }

  return { error: null };
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Unauthorized - Admin access required" };
  }

  if (user.id === userId) {
    return { error: "Cannot delete your own account" };
  }

  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    console.error("Error deleting user:", error);
    return { error: error.message };
  }

  return { error: null };
}
