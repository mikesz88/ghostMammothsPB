import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership Settings",
  description: "Manage your membership and billing",
};

export default function SettingsMembershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
