"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Scale, ExternalLink, CheckCircle2, Circle, Gift, Globe2 } from "lucide-react";
import { Strain, SeedBank } from "@/lib/types";
import { useStore } from "@/context/StoreContext";
import { StarRating } from "@/components/StarRating";

// These partner banks always show, in this order, on every strain page —
// regardless of whether we have specific offer data for them.
const PINNED_BANKS = ["blimburn-seeds", "ilgm", "seedsman"];

export function StrainBuyBox({ strain, seedBanks }: { strain: Strain; seedBanks: SeedBank[] }) {
  const { toggleCompare, isInCompare } = useStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // One row per bank, listing every seed type it stocks for this strain
  // (empty if we have no offer data for that bank on this strain).
  const byBank = new Map<string, string[]>();
  for (const o of strain.offers) {
    if (!byBank.has(o.seedBankId)) byBank.set(o.seedBankId, []);
    const bankTypes = byBank.get(o.seedBankId)!;
    if (!bankTypes.includes(o.type)) bankTypes.push(o.type);
  }
  const bankRows: [string, string[]][] = PINNED_BANKS.map((id) => [id, byBank.get(id) ?? []]);

  const [selectedBankId] = bankRows[selectedIndex];
  const bank = seedBanks.find((s) => s.id === selectedBankId)!;
  const compared = isInCompare(strain.slug);

  return (
    <div>
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Recommended Seed Banks</h2>
        <p className="mb-3 mt-0.5 text-xs text-neutral-400">
          Trusted stores stocking {strain.name} seeds
        </p>
        <div className="flex flex-col gap-2.5">
          {bankRows.map(([bankId, bankTypes], i) => {
            const sb = seedBanks.find((s) => s.id === bankId)!;
            const selected = selectedIndex === i;
            return (
              <label
                key={bankId}
                className={`relative flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 transition ${
                  selected
                    ? "border-emerald-600 bg-emerald-50/70 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-emerald-200"
                }`}
              >
                {i === 0 && (
                  <span className="absolute -top-2.5 left-3 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Top Pick
                  </span>
                )}
                <input
                  type="radio"
                  name="seedbank"
                  checked={selected}
                  onChange={() => setSelectedIndex(i)}
                  className="sr-only"
                />
                <span className="flex min-w-0 items-center gap-3">
                  <Link
                    href={`/seed-banks/${sb.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    title={sb.name}
                    className="relative block h-8 w-24 shrink-0"
                  >
                    <Image
                      src={sb.logo}
                      alt={sb.name}
                      fill
                      sizes="96px"
                      className="object-contain object-left"
                    />
                  </Link>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <StarRating rating={sb.rating} />
                      {bankTypes.map((type) => (
                        <span
                          key={type}
                          className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500"
                        >
                          {type}
                        </span>
                      ))}
                    </span>
                    <span className="flex items-center gap-2.5 text-[10px] text-neutral-500">
                      {sb.freeSeeds && (
                        <span className="flex items-center gap-1">
                          <Gift size={11} className="text-emerald-600" /> Free Seeds
                        </span>
                      )}
                      {sb.worldwideShipping && (
                        <span className="flex items-center gap-1">
                          <Globe2 size={11} className="text-emerald-600" /> Worldwide
                        </span>
                      )}
                    </span>
                  </span>
                </span>
                {selected ? (
                  <CheckCircle2 size={22} className="shrink-0 text-emerald-600" />
                ) : (
                  <Circle size={22} className="shrink-0 text-neutral-200" />
                )}
              </label>
            );
          })}
        </div>
      </div>

      <a
        href={bank.url}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition"
      >
        Buy at {bank.name}
        <ExternalLink size={17} />
      </a>
      <p className="mt-2 text-center text-[11px] text-neutral-400">
        You&apos;ll complete your purchase securely on {bank.name}&apos;s website.
      </p>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => toggleCompare(strain.slug)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md border py-2.5 text-sm font-medium transition ${
            compared
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
          }`}
        >
          <Scale size={15} />
          {compared ? "In Compare" : "Compare"}
        </button>
      </div>
    </div>
  );
}
