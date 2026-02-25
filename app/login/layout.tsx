import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Ghost Mammoth PB",
  description: "Sign in to manage your queue and events",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
