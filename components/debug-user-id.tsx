"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DebugUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        setEmail(user.email);

        // Check if admin in database
        const { data: profile } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        setIsAdmin(profile?.is_admin || false);
      }
    };

    getUser();
  }, []);

  return (
    <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
      <CardHeader>
        <CardTitle className="text-sm">
          🔍 Debug Info (Remove this component later)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <strong>Auth User ID:</strong>
          <p className="font-mono text-xs break-all">
            {userId || "Not logged in"}
          </p>
        </div>
        <div>
          <strong>Email:</strong>
          <p>{email || "N/A"}</p>
        </div>
        <div>
          <strong>Is Admin in Database:</strong>
          <p>
            {isAdmin === null ? "Loading..." : isAdmin ? "✅ Yes" : "❌ No"}
          </p>
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Copy the Auth User ID above and run this in Supabase SQL Editor:
          </p>
          <pre className="text-xs bg-black text-white p-2 rounded mt-2 overflow-x-auto">
            {`UPDATE public.users 
SET is_admin = true 
WHERE id = '${userId || "YOUR-ID-HERE"}';`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
