import Link from "next/link";
import { seedBanks } from "@/data/seedbanks";
import { SeedBankCard } from "@/components/SeedBankCard";
import { JsonLd } from "@/components/JsonLd";
import { itemListSchema } from "@/lib/schema";

export const metadata = {
  title: "Seed Banks | GrowingWeed",
  description: "Compare the world's top cannabis seed banks by rating, catalog size, and shipping.",
};

export default function SeedBanksPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <JsonLd
        data={itemListSchema(
          "Cannabis Seed Banks",
          seedBanks.map((sb) => ({ name: sb.name, path: `/seed-banks/${sb.slug}` }))
        )}
      />
      <nav className="mb-4 text-xs text-neutral-400">
        <Link href="/" className="hover:text-emerald-700">Home</Link> / Seed Banks
      </nav>
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
          Cannabis Seed Banks
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Browse our full collection of {seedBanks.length} top-rated seed banks and breeders.
          Compare ratings, catalog size, free seed offers, and shipping before you buy.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {seedBanks.map((sb) => (
          <SeedBankCard key={sb.id} seedBank={sb} />
        ))}
      </div>
    </div>
  );
}
