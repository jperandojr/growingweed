import Link from "next/link";
import { notFound } from "next/navigation";
import { strains, getStrainBySlug } from "@/data/strains";
import { strainTypes } from "@/lib/strain-utils";
import { buildOverview } from "@/lib/strain-overview";
import { StrainGallery } from "@/components/strains/StrainGallery";
import { StarRating } from "@/components/StarRating";
import { ProductCard } from "@/components/ProductCard";
import { StrainBuyBox } from "@/components/strains/StrainBuyBox";
import { StrainProfile } from "@/components/strains/StrainProfile";
import { JsonLd } from "@/components/JsonLd";
import { strainProductSchema, breadcrumbSchema } from "@/lib/schema";

// Pre-render the curated flagships + most popular imports at build time;
// the rest of the 10k catalog renders on demand and is cached.
export function generateStaticParams() {
  return strains.slice(0, 200).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const strain = getStrainBySlug(slug);
  if (!strain) return {};
  return {
    title: `${strain.name} — Buy Cannabis Seeds | GrowingWeed`,
    description: strain.description,
    alternates: { canonical: `/strains/${strain.slug}` },
  };
}

export default async function StrainDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const strain = getStrainBySlug(slug);
  if (!strain) notFound();

  const related = strains
    .filter((s) => s.id !== strain.id && s.category.some((c) => strain.category.includes(c)))
    .slice(0, 5);

  const overview = buildOverview(strain);
  const jsonLd = [
    strainProductSchema(strain),
    breadcrumbSchema([
      { name: "Home", path: "" },
      { name: "Strains", path: "/strains" },
      { name: strain.name, path: `/strains/${strain.slug}` },
    ]),
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <nav className="mb-4 text-xs text-neutral-400">
        <Link href="/" className="hover:text-emerald-700">Home</Link> /{" "}
        <Link href="/strains" className="hover:text-emerald-700">Strains</Link> /{" "}
        {strain.name}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <StrainGallery
          name={strain.name}
          hue={strain.hue}
          images={strain.images}
          badge={strain.badge}
        />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {strainTypes(strain).join(" · ")}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900 sm:text-3xl">{strain.name}</h1>
          <div className="mt-2">
            <StarRating rating={strain.rating} reviewCount={strain.reviewCount} size={16} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">{strain.description}</p>

          <div className="mt-6 border-t border-neutral-100 pt-6">
            <StrainBuyBox strain={strain} />
          </div>
        </div>
      </div>

      <JsonLd data={jsonLd} />

      <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            {strain.name} Strain Overview
          </h2>
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-neutral-600">
            {overview.map((paragraph, i) => (
              <p key={i}>
                {paragraph.map((seg, j) =>
                  "text" in seg ? (
                    <span key={j}>{seg.text}</span>
                  ) : (
                    <Link
                      key={j}
                      href={`/strains/${seg.slug}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {seg.label}
                    </Link>
                  )
                )}
              </p>
            ))}
          </div>
        </div>

        <StrainProfile strain={strain} />
      </section>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 text-xl font-bold text-neutral-900">You Might Also Like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((s) => (
              <ProductCard key={s.id} strain={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
