import { strains } from "@/data/strains";
import { SITE_URL, STRAINS_PER_SITEMAP, xmlResponse } from "@/lib/sitemap-config";

// Sitemap index: one child sitemap per content type. Search consoles report
// each file separately, which is what keeps the types clearly labeled.
export function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const strainChunks = Math.ceil(strains.length / STRAINS_PER_SITEMAP);

  const entries: { label: string; file: string }[] = [
    { label: "Pages", file: "pages.xml" },
    { label: "Seed Banks", file: "seed-banks.xml" },
    { label: "Posts", file: "posts.xml" },
    ...Array.from({ length: strainChunks }, (_, i) => ({
      label: `Strains (part ${i + 1} of ${strainChunks})`,
      file: `strains-${i + 1}.xml`,
    })),
  ];

  const body = entries
    .map(
      (e) =>
        `  <!-- ${e.label} -->\n  <sitemap>\n    <loc>${SITE_URL}/sitemaps/${e.file}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
  return xmlResponse(xml);
}
