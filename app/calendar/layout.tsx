import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar | Ghost Mammoth PB",
  description: "Pickleball events calendar",
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
