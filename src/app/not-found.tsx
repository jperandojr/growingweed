import Link from "next/link";
import { Search, Leaf } from "lucide-react";
import { getAllPosts } from "@/data/blog";
import { PostCover } from "@/components/PostCover";

// Root not-found: Next.js renders this for every unmatched URL across the
// whole app (not just notFound() calls) and returns a real 404 status —
// no redirect to the homepage, per Google's guidance on 404 handling.
// Explicit noindex here overrides the root layout's default "index, follow"
// (without it, both would render as contradictory robots meta tags).
export const metadata = {
  title: "Page Not Found | GrowingWeed",
  robots: { index: false, follow: true },
};

const quickLinks = [
  { label: "Strain Library", href: "/strains" },
  { label: "Seed Banks", href: "/seed-banks" },
  { label: "Grow Guides", href: "/grow-guides" },
  { label: "Deals", href: "/deals" },
  { label: "Community", href: "/community" },
  { label: "Full Sitemap", href: "/sitemap" },
];

export default async function NotFound() {
  const recentGuides = (await getAllPosts()).slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <Leaf size={36} className="mx-auto text-emerald-600" strokeWidth={1.25} />
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">
        404
      </p>
      <h1 className="mt-2 text-2xl font-bold text-neutral-900 sm:text-3xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
        The link may be broken, the page may have moved, or it might never have existed. Try a
        search, or pick up from one of the links below.
      </p>

      <form action="/strains" method="GET" className="mx-auto mt-8 flex max-w-md items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 text-left focus-within:border-emerald-400">
          <Search size={16} className="shrink-0 text-neutral-300" />
          <input
            type="text"
            name="q"
            placeholder="Search 30,000+ strains…"
            className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Search
        </button>
      </form>

      <div className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
        <Link href="/" className="font-semibold text-emerald-700 hover:underline">
          Home
        </Link>
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-neutral-500 hover:text-neutral-900">
            {link.label}
          </Link>
        ))}
      </div>

      {recentGuides.length > 0 && (
        <div className="mt-16 border-t border-neutral-100 pt-10 text-left">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Or start with a guide
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {recentGuides.map((post) => (
              <Link key={post.id} href={`/${post.slug}`} className="group">
                <PostCover
                  image={post.image}
                  hue={post.hue}
                  className="aspect-[16/9] w-full rounded-lg"
                  iconClassName="w-8 h-8"
                />
                <p className="mt-2.5 text-sm font-medium leading-snug text-neutral-900 group-hover:text-emerald-700">
                  {post.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
