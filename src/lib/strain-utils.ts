import { Strain, StrainType } from "./types";

// Pure per-strain helpers. Kept separate from src/data/strains.ts so client
// components can use them without pulling the full 10k-strain catalog into
// the browser bundle.

/** Seed types available for a strain, in a stable display order. */
export function strainTypes(strain: Strain): StrainType[] {
  const order: StrainType[] = ["Feminized", "Autoflower", "Regular"];
  const present = new Set(strain.offers.map((o) => o.type));
  return order.filter((t) => present.has(t));
}

/** Cheapest offer, optionally restricted to one seed type. */
export function lowestOffer(strain: Strain, type?: StrainType) {
  const pool = type ? strain.offers.filter((o) => o.type === type) : strain.offers;
  return pool.reduce((min, o) => (o.price < min.price ? o : min), pool[0]);
}

/** Number of distinct seed banks stocking a strain (across all types). */
export function seedBankCount(strain: Strain) {
  return new Set(strain.offers.map((o) => o.seedBankId)).size;
}

export function thcInRange(thc: number, slug: string) {
  switch (slug) {
    case "low":
      return thc < 15;
    case "mild":
      return thc >= 15 && thc < 20;
    case "moderate":
      return thc >= 20 && thc < 25;
    case "high":
      return thc >= 25 && thc < 30;
    case "very-high":
      return thc >= 30;
    default:
      return true;
  }
}

export type ShopFilters = {
  q?: string;
  letter?: string; // "A".."Z" or "0-9"
  types?: string[];
  categories?: string[];
  effects?: string[];
  flavors?: string[];
  thc?: string[];
  badge?: string;
  sort?: string;
};

function matchesLetter(name: string, letter: string) {
  if (letter === "0-9") return !/^[a-zA-Z]/.test(name);
  return name.toUpperCase().startsWith(letter);
}

function popularity(s: Strain) {
  return s.reviewCount * s.rating;
}

/**
 * Default "Featured" order: the 100 most popular strains (by review volume
 * and rating) first, then the rest of the catalog in its original order.
 */
function featuredOrder(list: Strain[]): Strain[] {
  const top = [...list].sort((a, b) => popularity(b) - popularity(a)).slice(0, 100);
  const topSlugs = new Set(top.map((s) => s.slug));
  return [...top, ...list.filter((s) => !topSlugs.has(s.slug))];
}

/** Filter + sort a strain list. Runs server-side against the full catalog. */
export function filterStrains(all: Strain[], f: ShopFilters): Strain[] {
  let result = all.filter((s) => {
    if (f.q && !s.name.toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.letter && !matchesLetter(s.name, f.letter)) return false;
    if (f.types?.length && !f.types.some((t) => strainTypes(s).includes(t as StrainType)))
      return false;
    if (f.categories?.length && !f.categories.some((c) => s.category.includes(c))) return false;
    if (f.effects?.length && !f.effects.some((e) => s.effects.includes(e))) return false;
    if (f.flavors?.length && !f.flavors.some((fl) => s.flavors.includes(fl))) return false;
    if (f.thc?.length && !f.thc.some((t) => thcInRange(s.thc, t))) return false;
    if (f.badge && s.badge !== f.badge) return false;
    return true;
  });

  switch (f.sort) {
    case "price-asc":
      result = [...result].sort((a, b) => lowestOffer(a).price - lowestOffer(b).price);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => lowestOffer(b).price - lowestOffer(a).price);
      break;
    case "rating":
      result = [...result].sort((a, b) => b.rating - a.rating);
      break;
    case "thc":
      result = [...result].sort((a, b) => b.thc - a.thc);
      break;
    default:
      // "featured" — most popular strains on top
      result = featuredOrder(result);
  }
  return result;
}
