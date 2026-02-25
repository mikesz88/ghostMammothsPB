import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Event",
  description: "Manage event queue and courts",
};

export default function AdminEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
