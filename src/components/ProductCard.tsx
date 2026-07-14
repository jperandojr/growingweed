"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { Strain } from "@/lib/types";
import { StrainVisual } from "./StrainVisual";
import { StarRating } from "./StarRating";
import { useStore } from "@/context/StoreContext";
import { lowestOffer, strainTypes, seedBankCount } from "@/lib/strain-utils";

const badgeStyles: Record<string, string> = {
  Bestseller: "bg-red-600",
  "Top Rated": "bg-emerald-600",
  "High THC": "bg-rose-600",
  "Fast Flowering": "bg-orange-500",
  "High Yield": "bg-emerald-600",
  "CBD Rich": "bg-teal-600",
  New: "bg-blue-600",
};

export function ProductCard({ strain }: { strain: Strain }) {
  const { toggleCompare, isInCompare } = useStore();
  const offer = lowestOffer(strain);
  const compared = isInCompare(strain.slug);

  return (
    <div className="group relative flex flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition">
      <Link href={`/strains/${strain.slug}`} className="block">
        <div className="relative">
          <StrainVisual strain={strain} className="w-full aspect-square" sizes="(max-width: 640px) 50vw, 250px" />
          {strain.badge && (
            <span
              className={`absolute top-2 left-2 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white ${badgeStyles[strain.badge]}`}
            >
              {strain.badge}
            </span>
          )}
        </div>
      </Link>
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleCompare(strain.slug);
          }}
          aria-label="Toggle compare"
          className={`flex h-8 w-8 items-center justify-center rounded-full shadow ${
            compared ? "bg-emerald-600 text-white" : "bg-white text-neutral-600"
          }`}
        >
          <Scale size={15} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/strains/${strain.slug}`}>
          <h3 className="text-sm font-medium text-neutral-900 leading-snug line-clamp-2 hover:text-emerald-700">
            {strain.name}
          </h3>
        </Link>
        <p className="text-xs text-neutral-500">
          THC {strain.thc}% · {strainTypes(strain).join(" · ")}
        </p>
        <StarRating rating={strain.rating} reviewCount={strain.reviewCount} />
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900">
            from ${offer.price.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-400">{seedBankCount(strain)} Seed Banks</p>
        </div>
      </div>
    </div>
  );
}
