import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/sitemap-config";
import { StoreProvider } from "@/context/StoreContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PurchaseProof } from "@/components/PurchaseProof";
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema, webSiteSchema } from "@/lib/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "GrowingWeed — Learn to Grow Cannabis & Choose the Right Seeds",
  description:
    "The grower's guide to cannabis: cultivation guides for every stage of the grow, plus 30,000+ strains compared across the world's most trusted seed banks.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions (ColorZilla, Grammarly, …)
          inject attributes into <body> before React hydrates, triggering false
          mismatch warnings. This only silences attribute diffs on this tag. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <JsonLd data={[organizationSchema(), webSiteSchema()]} />
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <PurchaseProof />
        </StoreProvider>
      </body>
    </html>
  );
}
