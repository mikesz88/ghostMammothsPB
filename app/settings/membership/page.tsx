"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MembershipSettingsPage() {
  const router = useRouter();
  useEffect(() => {
    router.push("/settings");
  }, [router]);
  return null;
}
