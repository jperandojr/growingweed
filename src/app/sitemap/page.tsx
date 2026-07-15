import Link from "next/link";
import { seedBanks } from "@/data/seedbanks";
import { strains } from "@/data/strains";
import { getAllPosts } from "@/data/blog";

export const metadata = { title: "Sitemap | GrowingWeed" };

const mainPages = [
  { label: "Home", href: "/" },
  { label: "Cannabis Seeds", href: "/strains" },
  { label: "Seed Banks", href: "/seed-banks" },
  { label: "Deals & Discounts", href: "/deals" },
  { label: "Grow Guides", href: "/grow-guides" },
  { label: "Community", href: "/community" },
  { label: "Help Center", href: "/help" },
  { label: "About Us", href: "/about" },
  { label: "Compare", href: "/compare" },
];

export default function SitemapPage() {
  const blogPosts = getAllPosts();
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Sitemap</h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <SitemapCol title="Main Pages" items={mainPages} />
        <SitemapCol
          title="Seed Banks"
          items={seedBanks.map((s) => ({ label: s.name, href: `/seed-banks/${s.slug}` }))}
        />
        <SitemapCol
          title="Strains"
          items={strains.slice(0, 15).map((s) => ({ label: s.name, href: `/strains/${s.slug}` }))}
        />
        <SitemapCol
          title="Grow Guides"
          items={blogPosts.map((p) => ({ label: p.title, href: `/${p.slug}` }))}
        />
      </div>
    </div>
  );
}

function SitemapCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold text-neutral-900">{title}</h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-sm text-neutral-500 hover:text-emerald-700">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
