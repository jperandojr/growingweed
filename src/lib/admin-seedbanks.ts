import { SeedBank } from "./types";
import { getSeedBanks, saveSeedBanks } from "@/data/seedbanks";

export type SeedBankInput = Omit<SeedBank, "id" | "slug"> & { id?: string; slug?: string };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateSeedBank(input: Partial<SeedBank>): string | null {
  if (!input.name?.trim()) return "Name is required";
  if (!input.url?.trim()) return "Referral URL is required";
  if (!input.logo?.trim()) return "Logo is required";
  if (!input.description?.trim()) return "Description is required";
  if (typeof input.rating !== "number" || input.rating < 0 || input.rating > 5)
    return "Rating must be 0-5";
  if (typeof input.reviewCount !== "number" || input.reviewCount < 0)
    return "Review count must be 0 or more";
  if (typeof input.strainCount !== "number" || input.strainCount < 0)
    return "Strain count must be 0 or more";
  if (
    typeof input.established !== "number" ||
    input.established < 1900 ||
    input.established > new Date().getFullYear()
  )
    return "Established year looks wrong";
  return null;
}

export async function createSeedBank(input: SeedBankInput): Promise<SeedBank> {
  const list = await getSeedBanks();
  const slug = input.slug?.trim() || slugify(input.name);
  const id = input.id?.trim() || slug;
  if (!slug) throw new Error("Could not derive a slug from the name");
  if (list.some((s) => s.id === id || s.slug === slug))
    throw new Error(`A seed bank with id/slug "${id}" already exists`);
  const record: SeedBank = {
    ...input,
    id,
    slug,
    name: input.name.trim(),
    description: input.description.trim(),
    logo: input.logo.trim(),
    url: input.url.trim(),
    accent: input.accent?.trim() || "text-neutral-900",
  };
  await saveSeedBanks([...list, record]);
  return record;
}

export async function updateSeedBank(id: string, input: SeedBankInput): Promise<SeedBank> {
  const list = await getSeedBanks();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error(`Seed bank "${id}" not found`);
  const slug = input.slug?.trim() || list[idx].slug;
  if (list.some((s, i) => i !== idx && (s.id === id || s.slug === slug)))
    throw new Error(`Another seed bank already uses slug "${slug}"`);
  const record: SeedBank = {
    ...list[idx],
    ...input,
    id,
    slug,
    name: input.name.trim(),
    description: input.description.trim(),
    logo: input.logo.trim(),
    url: input.url.trim(),
    accent: input.accent?.trim() || "text-neutral-900",
  };
  list[idx] = record;
  await saveSeedBanks(list);
  return record;
}

export async function deleteSeedBank(id: string): Promise<boolean> {
  const list = await getSeedBanks();
  const next = list.filter((s) => s.id !== id);
  if (next.length === list.length) return false;
  await saveSeedBanks(next);
  return true;
}
