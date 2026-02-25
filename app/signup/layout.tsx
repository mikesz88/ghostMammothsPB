import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Ghost Mammoth PB",
  description: "Create an account to join event queues",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
