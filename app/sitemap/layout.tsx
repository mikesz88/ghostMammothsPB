import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Site map of all pages",
};

export default function SitemapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
