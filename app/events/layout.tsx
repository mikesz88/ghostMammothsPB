import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | Ghost Mammoth PB",
  description: "Upcoming pickleball events and queue management",
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
