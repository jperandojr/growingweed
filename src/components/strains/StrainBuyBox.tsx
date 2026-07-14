"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Scale, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, Circle, Gift, Globe2 } from "lucide-react";
import { Strain } from "@/lib/types";
import { seedBanks } from "@/data/seedbanks";
import { useStore } from "@/context/StoreContext";
import { StarRating } from "@/components/StarRating";

const TOP_OFFERS = 3;

// Partner banks always lead the recommendations, in this order.
const PINNED_BANKS = ["herbies", "crop-king-seeds"];

// Temporary: only show these seed banks on the product page; the rest are
// hidden for now (still shown elsewhere, e.g. /seed-banks).
const VISIBLE_BANKS = new Set(["herbies", "seedsman", "crop-king-seeds"]);

export function StrainBuyBox({ strain }: { strain: Strain }) {
  const { toggleCompare, isInCompare } = useStore();
  const [refBank, setRefBank] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // If the visitor arrived from a seed bank page, that bank ranks 3rd.
  useEffect(() => {
    try {
      const ref = window.sessionStorage.getItem("growingweed-ref-bank");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (ref) setRefBank(ref);
    } catch {
      // storage unavailable — ignore
    }
  }, []);

  // Recommended order: pinned partners, then the referring bank, then by rating.
  const tier = (bankId: string) => {
    const pinned = PINNED_BANKS.indexOf(bankId);
    if (pinned !== -1) return pinned;
    if (refBank && bankId === refBank) return PINNED_BANKS.length;
    return PINNED_BANKS.length + 1;
  };
  // One row per bank, listing every seed type it stocks for this strain.
  const byBank = new Map<string, string[]>();
  for (const o of strain.offers) {
    if (!byBank.has(o.seedBankId)) byBank.set(o.seedBankId, []);
    const bankTypes = byBank.get(o.seedBankId)!;
    if (!bankTypes.includes(o.type)) bankTypes.push(o.type);
  }
  const allBankRows = [...byBank.entries()].sort(([a], [b]) => {
    const t = tier(a) - tier(b);
    if (t !== 0) return t;
    const ra = seedBanks.find((s) => s.id === a)?.rating ?? 0;
    const rb = seedBanks.find((s) => s.id === b)?.rating ?? 0;
    return rb - ra;
  });
  // Only the three visible banks, unless none of them carry this strain —
  // then fall back to whoever does, so the page never has an empty buy box.
  const visibleOnly = allBankRows.filter(([bankId]) => VISIBLE_BANKS.has(bankId));
  const bankRows = visibleOnly.length > 0 ? visibleOnly : allBankRows;

  const visibleRows = showAll ? bankRows : bankRows.slice(0, TOP_OFFERS);
  const hiddenCount = bankRows.length - TOP_OFFERS;

  const [selectedBankId] = bankRows[Math.min(selectedIndex, bankRows.length - 1)];
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
          {visibleRows.map(([bankId, bankTypes], i) => {
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

        {hiddenCount > 0 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-neutral-200 py-2 text-xs font-medium text-neutral-500 hover:border-emerald-300 hover:text-emerald-700 transition"
          >
            {showAll ? (
              <>
                View Less <ChevronUp size={13} />
              </>
            ) : (
              <>
                View {hiddenCount} More Seed Bank{hiddenCount > 1 ? "s" : ""}{" "}
                <ChevronDown size={13} />
              </>
            )}
          </button>
        )}
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
