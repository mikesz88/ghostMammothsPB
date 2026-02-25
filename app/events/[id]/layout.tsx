import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Details",
  description: "Event queue and court information",
};

export default function EventDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
