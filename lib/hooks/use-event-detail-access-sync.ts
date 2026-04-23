"use client";

import { useEffect, useState } from "react";


import { canUserJoinEvent } from "@/lib/membership-helpers";
import { createClient } from "@/lib/supabase/client";

import type { EventDetailAccess } from "@/lib/events/event-detail-server";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

export function useEventDetailAccessSync(
  user: SupabaseAuthUser | null | undefined,
  eventId: string,
  initialAccess: EventDetailAccess,
  initialIsAdmin: boolean,
): {
  canJoin: boolean;
  joinReason: string | undefined;
  requiresPayment: boolean;
  paymentAmount: number | undefined;
  isAdmin: boolean;
} {
  const [canJoin, setCanJoin] = useState(initialAccess.canJoin);
  const [joinReason, setJoinReason] = useState(initialAccess.joinReason);
  const [requiresPayment, setRequiresPayment] = useState(
    initialAccess.requiresPayment,
  );
  const [paymentAmount, setPaymentAmount] = useState(
    initialAccess.paymentAmount,
  );
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  useEffect(() => {
    const syncAccessAndAdmin = async () => {
      if (!user) {
        setCanJoin(true);
        setJoinReason(undefined);
        setRequiresPayment(false);
        setPaymentAmount(undefined);
        setIsAdmin(false);
        return;
      }

      const access = await canUserJoinEvent(user.id, eventId);
      setCanJoin(access.canJoin);
      setJoinReason(access.reason);
      setRequiresPayment(access.requiresPayment);
      setPaymentAmount(access.amount);

      const supabase = createClient();
      const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.is_admin ?? false);
    };

    syncAccessAndAdmin();
  }, [user, eventId]);

  return {
    canJoin,
    joinReason,
    requiresPayment,
    paymentAmount,
    isAdmin,
  };
}
