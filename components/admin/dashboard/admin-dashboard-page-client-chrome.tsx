"use client";

import { Header } from "@/components/ui/header";

import type { ReactNode } from "react";


export function AdminDashboardPageClientChrome({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Header variant="admin" />
      {children}
    </>
  );
}
