// Shared sitemap configuration. Set SITE_URL in your environment (or edit the
// fallback) before going live so all sitemap URLs use the production domain.
export const SITE_URL = process.env.SITE_URL ?? "https://www.growingweed.com";

/** Max strain URLs per sitemap file (spec limit is 50,000; we stay well under). */
export const STRAINS_PER_SITEMAP = 20000;

/** Static pages included in the "pages" sitemap. */
export const STATIC_PAGES = [
  { path: "", priority: "1.0", changefreq: "daily" },
  { path: "/strains", priority: "0.9", changefreq: "daily" },
  { path: "/seed-banks", priority: "0.9", changefreq: "weekly" },
  { path: "/deals", priority: "0.8", changefreq: "daily" },
  { path: "/grow-guides", priority: "0.7", changefreq: "weekly" },
  { path: "/community", priority: "0.5", changefreq: "monthly" },
  { path: "/help", priority: "0.5", changefreq: "monthly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/sitemap", priority: "0.3", changefreq: "monthly" },
] as const;

export type SitemapUrl = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
};

export function renderUrlset(urls: SitemapUrl[]): string {
  const body = urls
    .map((u) => {
      const parts = [`    <loc>${u.loc}</loc>`];
      if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
      if (u.priority) parts.push(`    <priority>${u.priority}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
