import { Strain } from "./types";
import { strains } from "@/data/strains";
import { getStrainOverrides, saveStrainOverride } from "./strain-overrides";

const MAX_RESULTS = 50;

export type StrainSearchResult = Pick<Strain, "slug" | "name" | "thc" | "badge" | "category">;

/** Searches the base catalog by name/slug substring, with any admin edits
 *  applied first so results (and the badge/category shown) reflect the
 *  current state, not the original import. */
export async function searchStrains(query: string): Promise<StrainSearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const overrides = await getStrainOverrides();
  const results: StrainSearchResult[] = [];
  for (const base of strains) {
    const s = overrides[base.slug] ?? base;
    if (s.name.toLowerCase().includes(q) || s.slug.includes(q)) {
      results.push({ slug: s.slug, name: s.name, thc: s.thc, badge: s.badge, category: s.category });
      if (results.length >= MAX_RESULTS) break;
    }
  }
  return results;
}

const STRAIN_TYPES = new Set(["Feminized", "Autoflower", "Regular"]);

export function validateStrain(input: Partial<Strain>): string | null {
  if (!input.name?.trim()) return "Name is required";
  if (!input.slug?.trim()) return "Slug is required";
  if (typeof input.thc !== "number" || input.thc < 0 || input.thc > 40) return "THC must be 0-40";
  if (typeof input.cbd !== "number" || input.cbd < 0 || input.cbd > 40) return "CBD must be 0-40";
  if (typeof input.rating !== "number" || input.rating < 0 || input.rating > 5)
    return "Rating must be 0-5";
  if (typeof input.reviewCount !== "number" || input.reviewCount < 0)
    return "Review count must be 0 or more";
  if (!input.description?.trim()) return "Description is required";
  if (!Array.isArray(input.offers) || input.offers.length === 0)
    return "At least one seed bank offer is required";
  for (const o of input.offers) {
    if (!o.seedBankId?.trim()) return "Each offer needs a seed bank";
    if (typeof o.price !== "number" || o.price < 0) return "Each offer needs a valid price";
    if (!STRAIN_TYPES.has(o.type)) return "Each offer needs a valid seed type";
  }
  if (!Array.isArray(input.effects)) return "Effects must be a list";
  if (!Array.isArray(input.flavors)) return "Flavors must be a list";
  if (!Array.isArray(input.environment) || input.environment.length === 0)
    return "At least one environment (Indoor/Outdoor) is required";
  if (!Array.isArray(input.category)) return "Category must be a list";
  if (!input.difficulty) return "Difficulty is required";
  if (!input.floweringSpeed) return "Flowering speed is required";
  if (typeof input.hue !== "number" || input.hue < 0 || input.hue > 359) return "Hue must be 0-359";
  return null;
}

export async function saveStrainEdit(strain: Strain): Promise<void> {
  await saveStrainOverride(strain);
}
