import Link from "next/link";
import Image from "next/image";
import { SeedBank } from "@/lib/types";
import { StarRating } from "./StarRating";
import { Gift, Globe2 } from "lucide-react";

export function SeedBankCard({ seedBank }: { seedBank: SeedBank }) {
  return (
    <div className="flex h-full flex-col items-center rounded-xl border border-neutral-200 bg-white p-5 text-center hover:shadow-lg hover:-translate-y-0.5 transition">
      <Link
        href={`/seed-banks/${seedBank.slug}`}
        className="relative mb-3 block h-14 w-full"
      >
        <Image
          src={seedBank.logo}
          alt={`${seedBank.name} logo`}
          fill
          sizes="200px"
          className="object-contain"
        />
      </Link>
      <StarRating rating={seedBank.rating} />
      <p className="mt-1 text-xs text-neutral-400">
        {seedBank.reviewCount.toLocaleString()} reviews
      </p>
      <p className="mt-2 text-sm text-neutral-600">
        {seedBank.strainCount.toLocaleString()} Strains
      </p>
      <div className="mt-2 flex flex-col items-center gap-1 text-xs text-neutral-500">
        {seedBank.freeSeeds && (
          <span className="flex items-center gap-1">
            <Gift size={13} className="text-emerald-600" /> Free Seeds
          </span>
        )}
        {seedBank.worldwideShipping && (
          <span className="flex items-center gap-1">
            <Globe2 size={13} className="text-emerald-600" /> Worldwide Shipping
          </span>
        )}
      </div>
      <div className="mt-auto w-full pt-4">
        <a
          href={seedBank.url}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="block w-full rounded-md bg-emerald-600 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-emerald-700 transition"
        >
          Visit Store
        </a>
      </div>
    </div>
  );
}
