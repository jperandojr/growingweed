import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — GrowingWeed",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1400px] px-6 py-8">{children}</div>;
}
