import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage users and admin permissions",
};

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
