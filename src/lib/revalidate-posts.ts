import { revalidatePath } from "next/cache";

/** Call after any post create/edit/delete so the change shows up
 *  immediately instead of waiting out the page's ISR revalidate window
 *  (up to 30 minutes on the homepage, /grow-guides and article pages). */
export function revalidatePostPages(slug: string): void {
  revalidatePath(`/${slug}`);
  revalidatePath("/grow-guides");
  revalidatePath("/");
  revalidatePath("/sitemap");
}
