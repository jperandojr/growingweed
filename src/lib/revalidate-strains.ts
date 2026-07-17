import { revalidatePath } from "next/cache";

/** Call after any strain edit so the change shows up immediately instead of
 *  waiting out the page's ISR revalidate window (30 minutes). */
export function revalidateStrainPages(slug: string): void {
  revalidatePath(`/strains/${slug}`);
  revalidatePath("/strains");
  revalidatePath("/deals");
  revalidatePath("/");
  revalidatePath("/sitemap");
}

/** Call after any seed bank create/edit/delete. Every strain page shows a
 *  fixed set of pinned banks plus, for a deleted bank's product listing,
 *  the /seed-banks/[slug] page itself — but broad, cheap invalidation here
 *  beats tracking exactly which strain pages reference which bank. */
export function revalidateSeedBankPages(slug?: string): void {
  revalidatePath("/seed-banks");
  if (slug) revalidatePath(`/seed-banks/${slug}`);
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/sitemap");
}
