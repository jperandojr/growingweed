import { getAllStrains } from "@/data/strains";
import { lowestOffer } from "@/lib/strain-utils";
import { ProductCard } from "@/components/ProductCard";

export const metadata = {
  title: "Deals & Discounts | GrowingWeed",
  description: "The best current deals and discounts on cannabis seeds from top seed banks.",
};

// Re-checked periodically so admin strain edits show up without a redeploy.
export const revalidate = 1800;

export default async function DealsPage() {
  const strains = await getAllStrains();
  const deals = [...strains]
    .sort((a, b) => lowestOffer(a).price - lowestOffer(b).price)
    .slice(0, 60);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Limited Time</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Deals &amp; Discounts</h1>
        <p className="mt-2 max-w-xl text-sm text-emerald-100">
          Save on top-rated strains from the world&apos;s best seed banks. We track prices across
          all our partner stores so you always get the best deal.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {deals.map((s) => (
          <ProductCard key={s.id} strain={s} />
        ))}
      </div>
    </div>
  );
}
