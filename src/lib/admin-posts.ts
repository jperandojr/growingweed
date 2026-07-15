import { BlogPost } from "./types";
import { readJson, writeJson, deleteJson, existsJson, listJsonPathnames } from "./blob-json";

// Blob-backed post storage for the admin dashboard. Editable posts live as
// JSON blobs under content/articles/; the founding posts in src/data/blog.ts
// are read-only from the dashboard's perspective. Backed by Vercel Blob (not
// the local filesystem) so writes persist on Vercel's serverless runtime.

const ARTICLES_PREFIX = "content/articles/";

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function readTimeFor(content: string): string {
  const words = content.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 150))} min read`;
}

export type PostInput = {
  slug?: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  publishTime?: string; // HH:MM, 24-hour, UTC
  hue: number;
  content: string;
  keyword?: string;
  image?: string;
  metaTitle?: string;
};

export function validatePost(input: Partial<PostInput>): string | null {
  if (!input.title?.trim()) return "Title is required";
  if (!input.excerpt?.trim()) return "Excerpt is required";
  if (!input.category?.trim()) return "Category is required";
  if (!input.content?.trim() || input.content.trim().length < 100)
    return "Content is required (at least 100 characters)";
  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date))
    return "Date must be YYYY-MM-DD";
  if (input.publishTime && !/^\d{2}:\d{2}$/.test(input.publishTime))
    return "Publish time must be HH:MM";
  if (typeof input.hue !== "number" || input.hue < 0 || input.hue > 359)
    return "Hue must be 0-359";
  return null;
}

export async function listEditablePosts(): Promise<BlogPost[]> {
  const pathnames = await listJsonPathnames(ARTICLES_PREFIX);
  const posts = await Promise.all(
    pathnames
      .filter((p) => p.endsWith(".json"))
      .map((p) => readJson<Omit<BlogPost, "id"> | null>(p, null))
  );
  return posts
    .filter((raw): raw is Omit<BlogPost, "id"> => raw !== null)
    .map((raw) => ({ id: raw.slug, ...raw }) as BlogPost)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getEditablePost(slug: string): Promise<BlogPost | null> {
  const raw = await readJson<Omit<BlogPost, "id"> | null>(`${ARTICLES_PREFIX}${slug}.json`, null);
  return raw ? ({ id: raw.slug, ...raw } as BlogPost) : null;
}

// Articles live at root-level URLs, so slugs must not collide with pages.
const RESERVED_SLUGS = new Set([
  "about", "admin", "api", "community", "compare", "deals", "grow-guides",
  "help", "privacy", "robots.txt", "seed-banks", "sitemap", "sitemap.xml",
  "sitemaps", "strains", "terms",
]);

export async function savePost(
  input: PostInput,
  { isNew }: { isNew: boolean }
): Promise<{ slug: string }> {
  const slug = input.slug?.trim() || slugify(input.title);
  if (!slug) throw new Error("Could not derive a slug from the title");
  if (RESERVED_SLUGS.has(slug))
    throw new Error(`"${slug}" is a reserved URL — pick a different slug`);
  const pathname = `${ARTICLES_PREFIX}${slug}.json`;
  if (isNew && (await existsJson(pathname)))
    throw new Error(`A post with slug "${slug}" already exists`);

  const record = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    category: input.category.trim(),
    readTime: readTimeFor(input.content),
    date: input.date,
    ...(input.publishTime ? { publishTime: input.publishTime } : {}),
    hue: input.hue,
    content: input.content.trim(),
    ...(input.keyword?.trim() ? { keyword: input.keyword.trim() } : {}),
    ...(input.image?.trim() ? { image: input.image.trim() } : {}),
    ...(input.metaTitle?.trim() ? { metaTitle: input.metaTitle.trim() } : {}),
  };
  await writeJson(pathname, record);
  return { slug };
}

export async function deletePost(slug: string): Promise<boolean> {
  const pathname = `${ARTICLES_PREFIX}${slug}.json`;
  if (!(await existsJson(pathname))) return false;
  await deleteJson(pathname);
  return true;
}
