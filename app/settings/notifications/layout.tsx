import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Notification preferences",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
