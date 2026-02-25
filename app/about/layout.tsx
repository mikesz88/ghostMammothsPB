import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Ghost Mammoth PB",
  description: "About Ghost Mammoth Pickleball and smart queue management",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
