import { put, del, head, list } from "@vercel/blob";

// JSON-file-shaped data stored in Vercel Blob instead of the local
// filesystem, so admin writes (posts, content plan) persist on Vercel's
// read-only-at-runtime serverless environment. Each "file" is one blob at a
// fixed pathname, always overwritten in place (allowOverwrite: true) rather
// than versioned — the same read/replace-whole-file model the old fs code
// used, just backed by Blob instead of disk.

export async function readJson<T>(pathname: string, fallback: T): Promise<T> {
  try {
    const meta = await head(pathname);
    // No explicit cache override here: an explicit `cache: "no-store"`
    // marks every page that reads this as fully dynamic (no ISR), which is
    // both unnecessary — the pages that call this already revalidate on
    // their own schedule — and, in practice, ended up making unrelated
    // pages dynamic too. Let Next's default fetch caching apply.
    const res = await fetch(meta.url);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback; // not found, or any other lookup failure
  }
}

export async function writeJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

export async function deleteJson(pathname: string): Promise<void> {
  await del(pathname).catch(() => {});
}

export async function existsJson(pathname: string): Promise<boolean> {
  try {
    await head(pathname);
    return true;
  } catch {
    return false;
  }
}

/** Pathnames of every blob under `prefix` (e.g. "content/articles/"). Never
 *  throws — a lookup failure (e.g. Blob temporarily unreachable) degrades
 *  to an empty list rather than crashing whatever's calling it. */
export async function listJsonPathnames(prefix: string): Promise<string[]> {
  try {
    const pathnames: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      pathnames.push(...page.blobs.map((b) => b.pathname));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return pathnames;
  } catch {
    return [];
  }
}
