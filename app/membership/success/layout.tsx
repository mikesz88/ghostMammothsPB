import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership Confirmed",
  description: "Your membership is active",
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
