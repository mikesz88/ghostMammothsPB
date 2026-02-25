import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership Canceled",
  description: "Membership cancellation confirmation",
};

export default function CancelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
