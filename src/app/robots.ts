import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/sitemap-config";

// Recommended robots.txt for a Next.js site:
// - /_next/static/ and /_next/image stay crawlable (Google must fetch CSS/JS
//   to render pages — blocking all of /_next/ hurts indexing)
// - other /_next/ internals and /api/ are blocked
// - client-state pages (wishlist/compare) are blocked; they're also noindexed
// Filtered shop URLs (/strains?...) are intentionally NOT blocked here: they
// carry noindex meta + canonical, which crawlers can only see if allowed in.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/_next/static/", "/_next/image"],
        disallow: ["/_next/", "/api/", "/admin", "/wishlist", "/compare"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
