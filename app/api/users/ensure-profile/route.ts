import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * POST /api/users/ensure-profile
 * Ensures the authenticated user has a profile in the users table.
 * Uses service role to bypass RLS when client-side insert fails.
 * Only creates/updates the profile for the currently authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const supabaseAdmin = createServiceRoleClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service unavailable" },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const name =
      body.name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User";
    const skillLevel =
      body.skill_level ?? user.user_metadata?.skill_level ?? "intermediate";
    const phone = body.phone ?? user.user_metadata?.phone ?? null;

    const { error } = await supabaseAdmin.from("users").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        name,
        skill_level: skillLevel,
        phone: phone ?? "",
        is_admin: false,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("ensure-profile error:", error);
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("ensure-profile error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
