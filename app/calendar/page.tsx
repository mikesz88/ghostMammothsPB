"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const router = useRouter();
  useEffect(() => {
    router.push("/events");
  }, [router]);
  return null;
}
