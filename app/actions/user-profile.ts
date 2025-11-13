"use server";

import { createClient } from "@/lib/supabase/server";

export async function createUserProfile(
  userId: string,
  userData: {
    name: string;
    email: string;
    skillLevel: string;
    phone?: string;
  }
) {
  const supabase = await createClient();

  // Verify the user is authenticated and matches the userId
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || user.id !== userId) {
    return { error: "Unauthorized" };
  }

  // Create user profile
  const { error: profileError } = await supabase.from("users").insert({
    id: userId,
    name: userData.name,
    email: userData.email,
    skill_level: userData.skillLevel,
    phone: userData.phone || null,
    is_admin: false,
    membership_status: "free",
  });

  if (profileError) {
    console.error("Error creating user profile:", profileError);
    return { error: profileError.message };
  }

  return { success: true };
}
