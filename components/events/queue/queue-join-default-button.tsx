import { Button } from "@/components/ui/button";

import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export function QueueJoinDefaultButton({
  user,
  onJoinClick,
}: {
  user: SupabaseAuthUser | null;
  onJoinClick: () => void;
}) {
  return (
    <Button onClick={onJoinClick} disabled={!user}>
      Join Queue
    </Button>
  );
}
