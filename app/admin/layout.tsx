import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Ghost Mammoth PB",
  description: "Event and user administration",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
