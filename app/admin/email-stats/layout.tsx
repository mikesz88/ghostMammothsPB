import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Statistics",
  description: "Email delivery and bounce statistics",
};

export default function EmailStatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
