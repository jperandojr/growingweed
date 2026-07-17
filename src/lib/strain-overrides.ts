import { readJson, writeJson } from "./json-store";
import { Strain } from "./types";

// The 34k-strain catalog (src/data/strains-generated.json) is a static,
// git-committed snapshot — far too large to round-trip through Supabase on
// every admin edit. Instead, admin edits are stored separately as full
// replacement records keyed by slug, and merged on top of the base catalog
// at read time. Editing a strain never touches the base file.

const OVERRIDES_PATH = "content/strain-overrides.json";

export type StrainOverrides = Record<string, Strain>;

export async function getStrainOverrides(): Promise<StrainOverrides> {
  return readJson<StrainOverrides>(OVERRIDES_PATH, {});
}

export async function saveStrainOverride(strain: Strain): Promise<void> {
  const all = await getStrainOverrides();
  all[strain.slug] = strain;
  await writeJson(OVERRIDES_PATH, all);
}
