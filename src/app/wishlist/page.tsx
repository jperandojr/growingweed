"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Strain } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useStore();
  const [items, setItems] = useState<Strain[] | null>(null);

  useEffect(() => {
    if (wishlist.length === 0) return; // nothing to fetch; rendered as empty below
    let cancelled = false;
    fetch(`/api/strains?slugs=${encodeURIComponent(wishlist.join(","))}`)
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
  }, [wishlist]);

  const resolved = wishlist.length === 0 ? [] : items;

  if (resolved === null) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center text-sm text-neutral-400">
        Loading your wishlist…
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Heart size={40} className="mx-auto text-neutral-300" />
        <h1 className="mt-4 text-xl font-bold text-neutral-900">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Save strains you love and come back to them later.
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

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Your Wishlist</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {resolved.map((s) => (
          <ProductCard key={s.id} strain={s} />
        ))}
      </div>
    </div>
  );
}
