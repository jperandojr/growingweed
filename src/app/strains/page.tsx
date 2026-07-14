import Link from "next/link";
import { strains } from "@/data/strains";
import { filterStrains } from "@/lib/strain-utils";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar, SearchSortBar } from "@/components/strains/ShopControls";

// Index only the clean /strains URL; filtered and paginated variants are
// noindexed (follow) to keep faceted-navigation duplicates out of search.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const hasParams = ["q", "letter", "type", "category", "effect", "flavor", "thc", "badge", "sort", "page"].some(
    (k) => typeof sp[k] === "string" && sp[k]
  );
  return {
    title: "Shop Cannabis Seeds — GrowingWeed",
    description:
      "Browse and filter 30,000+ cannabis strains by seed type, category, effect, flavor and THC level.",
    alternates: { canonical: "/strains" },
    ...(hasParams ? { robots: { index: false, follow: true } } : {}),
  };
}

const PER_PAGE = 48;

type SP = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined) {
  return typeof v === "string" && v ? v : undefined;
}
function list(v: string | string[] | undefined) {
  const s = str(v);
  return s ? s.split(",") : [];
}

export default async function StrainsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const filtered = filterStrains(strains, {
    q: str(sp.q),
    letter: str(sp.letter),
    types: list(sp.type),
    categories: list(sp.category),
    effects: list(sp.effect),
    flavors: list(sp.flavor),
    thc: list(sp.thc),
    badge: str(sp.badge),
    sort: str(sp.sort),
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(Math.max(1, parseInt(str(sp.page) ?? "1", 10) || 1), totalPages);
  const items = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    for (const key of ["q", "letter", "type", "category", "effect", "flavor", "thc", "badge", "sort"]) {
      const v = str(sp[key]);
      if (v) params.set(key, v);
    }
    if (p > 1) params.set("page", String(p));
    return `/strains${params.size ? `?${params}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Cannabis Seeds</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {filtered.length.toLocaleString()} of {strains.length.toLocaleString()} strains
          {str(sp.badge) ? ` · ${str(sp.badge)}` : ""}
        </p>
      </div>

      <SearchSortBar />

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <FilterSidebar />

        <div>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 p-12 text-center text-sm text-neutral-500">
              No strains match your filters. Try clearing some filters.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {items.map((s) => (
                  <ProductCard key={s.id} strain={s} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-1.5 text-sm">
                  {page > 1 && (
                    <Link
                      href={pageHref(page - 1)}
                      className="rounded-md border border-neutral-200 px-3 py-2 text-neutral-600 hover:border-emerald-300"
                    >
                      ← Prev
                    </Link>
                  )}
                  {pageWindow(page, totalPages).map((p, i) =>
                    p === null ? (
                      <span key={`gap-${i}`} className="px-1 text-neutral-400">
                        …
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={pageHref(p)}
                        className={`rounded-md border px-3.5 py-2 ${
                          p === page
                            ? "border-emerald-600 bg-emerald-600 font-semibold text-white"
                            : "border-neutral-200 text-neutral-600 hover:border-emerald-300"
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  )}
                  {page < totalPages && (
                    <Link
                      href={pageHref(page + 1)}
                      className="rounded-md border border-neutral-200 px-3 py-2 text-neutral-600 hover:border-emerald-300"
                    >
                      Next →
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** e.g. 1 … 4 5 [6] 7 8 … 210 */
function pageWindow(current: number, total: number): (number | null)[] {
  const pages = new Set<number>([1, total]);
  for (let p = current - 2; p <= current + 2; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push(null);
    out.push(p);
    prev = p;
  }
  return out;
}
