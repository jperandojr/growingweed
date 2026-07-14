import type { Metadata } from "next";

// Client-state page — personal to each visitor, nothing to index.
export const metadata: Metadata = {
  title: "Compare Strains — GrowingWeed",
  robots: { index: false, follow: true },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
