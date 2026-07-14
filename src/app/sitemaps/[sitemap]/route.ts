import { NextRequest } from "next/server";
import { strains } from "@/data/strains";
import { seedBanks } from "@/data/seedbanks";
import { getAllPosts } from "@/data/blog";
import {
  SITE_URL,
  STRAINS_PER_SITEMAP,
  STATIC_PAGES,
  renderUrlset,
  xmlResponse,
  SitemapUrl,
} from "@/lib/sitemap-config";

// Serves the per-type sitemaps referenced by /sitemap.xml:
//   /sitemaps/pages.xml       — static pages
//   /sitemaps/seed-banks.xml  — seed bank profiles
//   /sitemaps/posts.xml       — grow guides / blog posts
//   /sitemaps/strains-N.xml   — strain pages, chunked

// Re-checked periodically so scheduled posts drop off/into posts.xml on time.
export const revalidate = 1800;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sitemap: string }> }
) {
  const { sitemap } = await params;
  const today = new Date().toISOString().slice(0, 10);

  if (sitemap === "pages.xml") {
    const urls: SitemapUrl[] = STATIC_PAGES.map((p) => ({
      loc: `${SITE_URL}${p.path}`,
      lastmod: today,
      changefreq: p.changefreq,
      priority: p.priority,
    }));
    return xmlResponse(renderUrlset(urls));
  }

  if (sitemap === "seed-banks.xml") {
    const urls: SitemapUrl[] = seedBanks.map((sb) => ({
      loc: `${SITE_URL}/seed-banks/${sb.slug}`,
      lastmod: today,
      changefreq: "weekly",
      priority: "0.8",
    }));
    return xmlResponse(renderUrlset(urls));
  }

  if (sitemap === "posts.xml") {
    const urls: SitemapUrl[] = getAllPosts().map((p) => ({
      loc: `${SITE_URL}/${p.slug}`,
      lastmod: p.date,
      changefreq: "monthly",
      priority: "0.6",
    }));
    return xmlResponse(renderUrlset(urls));
  }

  const strainMatch = sitemap.match(/^strains-(\d+)\.xml$/);
  if (strainMatch) {
    const page = parseInt(strainMatch[1], 10);
    const totalChunks = Math.ceil(strains.length / STRAINS_PER_SITEMAP);
    if (page >= 1 && page <= totalChunks) {
      const chunk = strains.slice((page - 1) * STRAINS_PER_SITEMAP, page * STRAINS_PER_SITEMAP);
      const urls: SitemapUrl[] = chunk.map((s) => ({
        loc: `${SITE_URL}/strains/${s.slug}`,
        lastmod: today,
        changefreq: "weekly",
        priority: "0.7",
      }));
      return xmlResponse(renderUrlset(urls));
    }
  }

  return new Response("Not found", { status: 404 });
}
