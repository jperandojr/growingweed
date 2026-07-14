import type { Metadata } from "next";

// Client-state page — personal to each visitor, nothing to index.
export const metadata: Metadata = {
  title: "Your Wishlist — GrowingWeed",
  robots: { index: false, follow: true },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
