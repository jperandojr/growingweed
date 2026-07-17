import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getAllPosts } from "@/data/blog";
import { getSeedBanks } from "@/data/seedbanks";
import { getStrainBySlug } from "@/data/strains";
import { strainTypes } from "@/lib/strain-utils";
import { PostCover } from "@/components/PostCover";
import { StrainVisual } from "@/components/StrainVisual";
import { Carousel } from "@/components/Carousel";

// Magazine-style minimalist front page: typographic hero, featured guide,
// editor's strain picks, seed bank index, single pull quote.

// Re-checked periodically so newly-due scheduled posts appear without a redeploy.
export const revalidate = 1800;

const editorsPicks = [
  "blue-dream",
  "northern-lights",
  "white-widow",
  "girl-scout-cookies",
  "wedding-cake",
  "gorilla-glue-4",
];

const browseLinks = [
  { label: "Feminized", href: "/strains?category=feminized" },
  { label: "Autoflower", href: "/strains?category=autoflower" },
  { label: "High THC", href: "/strains?category=high-thc" },
  { label: "CBD", href: "/strains?category=cbd" },
  { label: "Beginner Friendly", href: "/strains?category=beginner" },
  { label: "Fast Flowering", href: "/strains?category=fast-flowering" },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
      {children}
    </p>
  );
}

function SectionHeader({
  kicker,
  linkLabel,
  linkHref,
}: {
  kicker: string;
  linkLabel: string;
  linkHref: string;
}) {
  return (
    <div className="mb-10 flex items-end justify-between">
      <div>
        <Kicker>{kicker}</Kicker>
        <span className="mt-2.5 block h-[3px] w-10 rounded-full bg-emerald-600" />
      </div>
      <Link
        href={linkHref}
        className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-emerald-700"
      >
        {linkLabel} <ArrowRight size={12} />
      </Link>
    </div>
  );
}

export default async function Home() {
  const blogPosts = await getAllPosts();
  const [featuredPost, ...restPosts] = blogPosts;
  const seedBanks = await getSeedBanks();
  const pickResults = await Promise.all(editorsPicks.map(getStrainBySlug));
  const picks = pickResults.filter((s): s is NonNullable<typeof s> => !!s);
  const [featuredStrain, ...listStrains] = picks;

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* ---- Hero ---- */}
      <section className="py-20 md:py-28">
        <Kicker>GrowingWeed.com</Kicker>
        <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
          Grow your own cannabis. We&apos;ll show you how.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-500">
          Honest guides for every stage of the grow — and 30,000+ strains compared
          across the world&apos;s most trusted seed banks, so you start with the
          right genetics.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-5">
          <Link
            href="/grow-guides"
            className="rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Start with the Guides
          </Link>
          <Link
            href="/strains"
            className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 hover:text-emerald-700"
          >
            Browse the strain library <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-16 flex flex-wrap gap-x-10 gap-y-3 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
          <span>30,000+ Strains Compared</span>
          <span>9 Trusted Seed Banks</span>
          <span>Guides For Every Grow Stage</span>
        </div>
      </section>

      {/* ---- The Guides ---- */}
      {featuredPost && (
      <section className="pb-20">
        <SectionHeader kicker="The Guides" linkLabel="All guides" linkHref="/grow-guides" />
        <div className="grid gap-12 lg:grid-cols-3">
          <Link href={`/${featuredPost.slug}`} className="group lg:col-span-2">
            <PostCover
              image={featuredPost.image}
              hue={featuredPost.hue}
              className="aspect-[16/9] w-full rounded-xl"
              iconClassName="w-12 h-12"
            />
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              {featuredPost.category}
            </p>
            <h2 className="mt-2 max-w-xl text-2xl font-bold leading-snug text-neutral-900 group-hover:text-emerald-700 sm:text-3xl">
              {featuredPost.title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
              {featuredPost.excerpt}
            </p>
          </Link>

          <div className="flex flex-col">
            {restPosts.map((post) => (
              <Link
                key={post.id}
                href={`/${post.slug}`}
                className="group border-b border-neutral-200 py-5 first:pt-0 last:border-b-0"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  {post.category}
                </p>
                <h3 className="mt-1.5 text-base font-semibold leading-snug text-neutral-900 group-hover:text-emerald-700">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-xs text-neutral-400">{post.readTime}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ---- Strains worth growing ---- */}
      <section className="pb-20">
        <SectionHeader
          kicker="Strains Worth Growing"
          linkLabel="Browse all strains"
          linkHref="/strains"
        />
        <div className="grid gap-12 lg:grid-cols-2">
          <Link href={`/strains/${featuredStrain.slug}`} className="group">
            <StrainVisual
              strain={featuredStrain}
              className="aspect-[4/3] w-full rounded-xl"
              iconClassName="w-14 h-14"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
            <h2 className="mt-5 text-2xl font-bold text-neutral-900 group-hover:text-emerald-700">
              {featuredStrain.name}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-500">
              {featuredStrain.description}
            </p>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
              {featuredStrain.difficulty} · THC {featuredStrain.thc}% ·{" "}
              {strainTypes(featuredStrain).join(" & ")}
            </p>
          </Link>

          <ol className="flex flex-col">
            {listStrains.map((strain, i) => (
              <li key={strain.slug} className="border-b border-neutral-200 last:border-b-0">
                <Link
                  href={`/strains/${strain.slug}`}
                  className="group flex items-center gap-6 py-5"
                >
                  <span className="w-10 shrink-0 text-2xl font-bold tabular-nums text-neutral-200">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-neutral-900 group-hover:text-emerald-700">
                      {strain.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-400">
                      {strain.difficulty} grow · THC {strain.thc}% ·{" "}
                      {strain.floweringSpeed === "Fast Flowering" ? "Fast flowering" : "9–10 weeks"}
                    </span>
                  </span>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-neutral-300 transition group-hover:translate-x-1 group-hover:text-emerald-700"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-neutral-50 px-6 py-4 text-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Browse by
          </span>
          {browseLinks.map((b) => (
            <Link
              key={b.label}
              href={b.href}
              className="text-sm text-neutral-600 underline-offset-4 hover:text-emerald-700 hover:underline"
            >
              {b.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Where to buy ---- */}
      <section className="pb-20">
        <SectionHeader
          kicker="Where to Buy Seeds"
          linkLabel="Compare seed banks"
          linkHref="/seed-banks"
        />
        <Carousel>
          {seedBanks.map((bank) => (
            <Link
              key={bank.id}
              href={`/seed-banks/${bank.slug}`}
              title={bank.name}
              className="group flex w-[calc(50%-8px)] shrink-0 flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-7 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg sm:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)]"
            >
              <span className="relative h-16 w-full">
                <Image
                  src={bank.logo}
                  alt={bank.name}
                  fill
                  sizes="220px"
                  className="object-contain"
                />
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-semibold tabular-nums text-neutral-900">
                  ★ {bank.rating}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {bank.reviewCount.toLocaleString()} reviews
                </span>
              </span>
            </Link>
          ))}
        </Carousel>
      </section>

      {/* ---- Pull quote ---- */}
      <section className="pb-24">
        <div className="rounded-3xl bg-neutral-50 px-8 py-16 text-center">
          <blockquote className="mx-auto max-w-2xl text-2xl font-medium leading-snug tracking-tight text-neutral-900 sm:text-3xl">
            &ldquo;From first seed to first harvest — the guides told me what to do,
            and the strain library told me what to grow.&rdquo;
          </blockquote>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Mike R. — First-Time Grower
          </p>
        </div>
      </section>
    </div>
  );
}
