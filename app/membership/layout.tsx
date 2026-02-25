import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership | Ghost Mammoth PB",
  description: "Membership plans and benefits",
};

export default function MembershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
