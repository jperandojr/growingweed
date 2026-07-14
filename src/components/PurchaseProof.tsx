"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, BadgeCheck } from "lucide-react";
import { proofStrains, proofLocations } from "@/data/purchase-pool";
import { seedBanks } from "@/data/seedbanks";
import { PlantArt } from "./PlantArt";

type ProofEvent = {
  location: string;
  strainName: string;
  strainSlug: string;
  hue: number;
  bankName: string;
  minutesAgo: number;
};

// Deterministic PRNG so the same day always produces the same set of
// "purchases" — the pool refreshes automatically every day.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dailyEvents(count: number): ProofEvent[] {
  const today = new Date();
  const dayKey =
    today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const rand = mulberry32(dayKey);
  const events: ProofEvent[] = [];
  for (let i = 0; i < count; i++) {
    const strain = proofStrains[Math.floor(rand() * proofStrains.length)];
    const bankId = strain.banks[Math.floor(rand() * strain.banks.length)];
    const bank = seedBanks.find((b) => b.id === bankId);
    events.push({
      location: proofLocations[Math.floor(rand() * proofLocations.length)],
      strainName: strain.name,
      strainSlug: strain.slug,
      hue: strain.hue,
      bankName: bank?.name ?? "a top seed bank",
      minutesAgo: 2 + Math.floor(rand() * 56),
    });
  }
  return events;
}

const FIRST_DELAY = 7_000; // wait before the first toast
const VISIBLE_FOR = 7_000; // how long each toast stays on screen
const GAP = 14_000; // pause between toasts

export function PurchaseProof() {
  const [events, setEvents] = useState<ProofEvent[] | null>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Generate on the client only (uses today's date + sessionStorage) to avoid
  // a hydration mismatch — one intentional post-mount sync from external state.
  useEffect(() => {
    if (window.sessionStorage.getItem("growingweed-proof-dismissed")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(true);
      return;
    }
    setEvents(dailyEvents(24));
  }, []);

  useEffect(() => {
    if (!events || dismissed) return;
    let hideTimer: ReturnType<typeof setTimeout>;
    const showTimer = setTimeout(
      () => {
        setVisible(true);
        hideTimer = setTimeout(() => {
          setVisible(false);
          setIndex((i) => (i + 1) % events.length);
        }, VISIBLE_FOR);
      },
      index === 0 ? FIRST_DELAY : GAP
    );
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [events, index, dismissed]);

  if (!events || dismissed) return null;
  const ev = events[index];

  const dismiss = () => {
    setDismissed(true);
    window.sessionStorage.setItem("growingweed-proof-dismissed", "1");
  };

  return (
    <div
      aria-live="polite"
      className={`fixed bottom-4 left-4 z-50 w-80 max-w-[calc(100vw-2rem)] transition-all duration-500 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div className="relative flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3 pr-8 shadow-xl">
        <button
          onClick={dismiss}
          aria-label="Dismiss purchase notifications"
          className="absolute right-2 top-2 text-neutral-300 hover:text-neutral-500"
        >
          <X size={14} />
        </button>
        <Link href={`/strains/${ev.strainSlug}`} className="shrink-0">
          <PlantArt hue={ev.hue} className="h-12 w-12 rounded-lg" iconClassName="w-5 h-5" />
        </Link>
        <div className="min-w-0 text-xs leading-relaxed text-neutral-600">
          <p>
            Someone from <span className="font-semibold text-neutral-900">{ev.location}</span>{" "}
            purchased{" "}
            <Link
              href={`/strains/${ev.strainSlug}`}
              className="font-semibold text-emerald-700 hover:underline"
            >
              {ev.strainName}
            </Link>{" "}
            from <span className="font-semibold text-neutral-900">{ev.bankName}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-neutral-400">
            <BadgeCheck size={12} className="text-emerald-600" />
            Verified purchase · {ev.minutesAgo} minutes ago
          </p>
        </div>
      </div>
    </div>
  );
}
