import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit User",
  description: "Edit user profile and permissions",
};

export default function AdminUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
