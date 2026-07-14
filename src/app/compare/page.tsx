"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scale, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Strain } from "@/lib/types";
import { lowestOffer, strainTypes, seedBankCount } from "@/lib/strain-utils";
import { StrainVisual } from "@/components/StrainVisual";
import { StarRating } from "@/components/StarRating";

export default function ComparePage() {
  const { compare, toggleCompare } = useStore();
  const [items, setItems] = useState<Strain[] | null>(null);

  useEffect(() => {
    if (compare.length === 0) return; // nothing to fetch; rendered as empty below
    let cancelled = false;
    fetch(`/api/strains?slugs=${encodeURIComponent(compare.join(","))}`)
      .then((r) => r.json())
      .then((data: Strain[]) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [compare]);

  const resolved = compare.length === 0 ? [] : items;

  if (resolved === null) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center text-sm text-neutral-400">
        Loading comparison…
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Scale size={40} className="mx-auto text-neutral-300" />
        <h1 className="mt-4 text-xl font-bold text-neutral-900">No strains to compare</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Add up to 4 strains to compare their THC, effects, flavors and price.
        </p>
        <Link
          href="/strains"
          className="mt-6 inline-block rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition"
        >
          Shop Strains
        </Link>
      </div>
    );
  }

  const rows: { label: string; render: (s: Strain) => React.ReactNode }[] = [
    { label: "Price from", render: (s) => `$${lowestOffer(s).price.toFixed(2)}` },
    { label: "Seed Types", render: (s) => strainTypes(s).join(", ") },
    { label: "THC", render: (s) => `${s.thc}%` },
    { label: "CBD", render: (s) => `${s.cbd}%` },
    { label: "Rating", render: (s) => <StarRating rating={s.rating} reviewCount={s.reviewCount} /> },
    { label: "Difficulty", render: (s) => s.difficulty },
    { label: "Flowering", render: (s) => s.floweringSpeed },
    { label: "Environment", render: (s) => s.environment.join(", ") },
    { label: "Effects", render: (s) => s.effects.join(", ") },
    { label: "Flavors", render: (s) => s.flavors.join(", ") },
    { label: "Seed Banks", render: (s) => `${seedBankCount(s)} available` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Compare Strains</h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-32"></th>
              {resolved.map((s) => (
                <th key={s.id} className="p-3 text-left align-top">
                  <div className="relative w-40">
                    <button
                      onClick={() => toggleCompare(s.slug)}
                      className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
                    >
                      <X size={12} />
                    </button>
                    <StrainVisual strain={s} className="aspect-square w-full rounded-lg" iconClassName="w-8 h-8" sizes="160px" />
                    <Link
                      href={`/strains/${s.slug}`}
                      className="mt-2 block text-sm font-semibold text-neutral-900 hover:text-emerald-700"
                    >
                      {s.name}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-neutral-50" : ""}>
                <td className="p-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {row.label}
                </td>
                {resolved.map((s) => (
                  <td key={s.id} className="p-3 text-sm text-neutral-700">
                    {row.render(s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
