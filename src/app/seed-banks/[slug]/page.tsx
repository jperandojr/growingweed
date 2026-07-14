import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Gift, Globe2, Calendar, BadgeCheck } from "lucide-react";
import { getSeedBankBySlug } from "@/data/seedbanks";
import { strains } from "@/data/strains";
import { StarRating } from "@/components/StarRating";
import { ProductCard } from "@/components/ProductCard";
import { RefBankTracker } from "@/components/RefBankTracker";
import { JsonLd } from "@/components/JsonLd";
import { seedBankSchema, breadcrumbSchema } from "@/lib/schema";

const PER_PAGE = 48;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const seedBank = getSeedBankBySlug(slug);
  if (!seedBank) return {};
  const { page } = await searchParams;
  const paginated = !!page && page !== "1";
  return {
    title: `${seedBank.name} — Seed Bank Reviews & Strains | GrowingWeed`,
    description: seedBank.description,
    // paginated views canonicalize to the first page and stay out of the index
    alternates: { canonical: `/seed-banks/${seedBank.slug}` },
    ...(paginated ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function SeedBankDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const seedBank = getSeedBankBySlug(slug);
  if (!seedBank) notFound();

  const products = strains.filter((s) => s.offers.some((o) => o.seedBankId === seedBank.id));
  const { page: pageParam } = await searchParams;
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const page = Math.min(Math.max(1, parseInt(pageParam ?? "1", 10) || 1), totalPages);
  const items = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <RefBankTracker bankId={seedBank.id} />
      <JsonLd
        data={[
          seedBankSchema(seedBank),
          breadcrumbSchema([
            { name: "Home", path: "" },
            { name: "Seed Banks", path: "/seed-banks" },
            { name: seedBank.name, path: `/seed-banks/${seedBank.slug}` },
          ]),
        ]}
      />
      <nav className="mb-4 text-xs text-neutral-400">
        <Link href="/" className="hover:text-emerald-700">Home</Link> /{" "}
        <Link href="/seed-banks" className="hover:text-emerald-700">Seed Banks</Link> /{" "}
        {seedBank.name}
      </nav>

      <div className="flex flex-col gap-6 rounded-xl border border-neutral-100 bg-neutral-50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="relative h-16 w-56">
            <Image
              src={seedBank.logo}
              alt={`${seedBank.name} logo`}
              fill
              sizes="224px"
              className="object-contain object-left"
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <StarRating rating={seedBank.rating} reviewCount={seedBank.reviewCount} />
          </div>
          <p className="mt-3 max-w-xl text-sm text-neutral-600">{seedBank.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <BadgeCheck size={14} className="text-emerald-600" /> {seedBank.strainCount.toLocaleString()} Strains
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-600" /> Est. {seedBank.established}
            </span>
            {seedBank.freeSeeds && (
              <span className="flex items-center gap-1.5">
                <Gift size={14} className="text-emerald-600" /> Free Seeds
              </span>
            )}
            {seedBank.worldwideShipping && (
              <span className="flex items-center gap-1.5">
                <Globe2 size={14} className="text-emerald-600" /> Worldwide Shipping
              </span>
            )}
          </div>
        </div>
        <a
          href={seedBank.url}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="shrink-0 rounded-md bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700 transition"
        >
          Visit Store
        </a>
      </div>

      <div id="products" className="mt-10 scroll-mt-20">
        <h2 className="mb-5 text-xl font-bold text-neutral-900">
          {products.length.toLocaleString()} Strains from {seedBank.name}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((strain) => (
            <ProductCard key={strain.id} strain={strain} />
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-2 text-sm">
            {page > 1 && (
              <Link
                href={`/seed-banks/${seedBank.slug}?page=${page - 1}#products`}
                className="rounded-md border border-neutral-200 px-3 py-2 text-neutral-600 hover:border-emerald-300"
              >
                ← Prev
              </Link>
            )}
            <span className="px-2 text-neutral-500">
              Page {page.toLocaleString()} of {totalPages.toLocaleString()}
            </span>
            {page < totalPages && (
              <Link
                href={`/seed-banks/${seedBank.slug}?page=${page + 1}#products`}
                className="rounded-md border border-neutral-200 px-3 py-2 text-neutral-600 hover:border-emerald-300"
              >
                Next →
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
