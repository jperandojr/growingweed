"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/lib/types";
import { PlantArt } from "@/components/PlantArt";

const badgeStyles: Record<string, string> = {
  Bestseller: "bg-red-600",
  "Top Rated": "bg-emerald-600",
  "High THC": "bg-rose-600",
  "Fast Flowering": "bg-orange-500",
  "High Yield": "bg-emerald-600",
  "CBD Rich": "bg-teal-600",
  New: "bg-blue-600",
};

export function StrainGallery({
  name,
  hue,
  images = [],
  badge,
}: {
  name: string;
  hue: number;
  images?: string[];
  badge?: Badge;
}) {
  const [selected, setSelected] = useState(0);

  const badgeEl = badge && (
    <span
      className={`absolute top-3 left-3 z-10 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white ${badgeStyles[badge]}`}
    >
      {badge}
    </span>
  );

  if (images.length === 0) {
    return (
      <div className="relative">
        {badgeEl}
        <PlantArt hue={hue} className="w-full aspect-square rounded-xl" iconClassName="w-24 h-24" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
        {badgeEl}
        <Image
          src={images[Math.min(selected, images.length - 1)]}
          alt={`${name} cannabis strain`}
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setSelected(i)}
              aria-label={`View image ${i + 1} of ${name}`}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                selected === i
                  ? "border-emerald-600"
                  : "border-transparent hover:border-neutral-300"
              }`}
            >
              <Image
                src={src}
                alt={`${name} — view ${i + 1}`}
                fill
                sizes="150px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
