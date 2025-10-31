"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotificationSettingsPage() {
  const router = useRouter();
  useEffect(() => {
    router.push("/settings");
  }, [router]);
  return null;
}
