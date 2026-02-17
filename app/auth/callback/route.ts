import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/login";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure user profile exists (e.g. after email confirmation)
      const supabaseAdmin = createServiceRoleClient();
      if (supabaseAdmin) {
        const user = data.user;
        await supabaseAdmin.from("users").upsert(
          {
            id: user.id,
            email: user.email ?? "",
            name: user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User",
            skill_level: user.user_metadata?.skill_level ?? "intermediate",
            phone: user.user_metadata?.phone ?? "",
            is_admin: false,
          },
          { onConflict: "id" }
        );
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    if (error) {
      console.error("Auth callback error:", error.message);
    }
  }

  // Redirect to login with error if code exchange failed or no code
  return NextResponse.redirect(`${origin}/login?message=Could not authenticate`);
}
