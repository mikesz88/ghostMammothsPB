import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the site",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
