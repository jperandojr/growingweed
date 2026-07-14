import fs from "node:fs";
import path from "node:path";
import { BlogPost } from "./types";

// File-backed post storage for the admin dashboard. Editable posts live as
// JSON in content/articles/; the founding posts in src/data/blog.ts are
// read-only from the dashboard's perspective.

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

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
  if (typeof input.hue !== "number" || input.hue < 0 || input.hue > 359)
    return "Hue must be 0-359";
  return null;
}

export function listEditablePosts(): BlogPost[] {
  try {
    return fs
      .readdirSync(ARTICLES_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const raw = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), "utf8"));
        return { id: raw.slug, ...raw } as BlogPost;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch {
    return [];
  }
}

export function getEditablePost(slug: string): BlogPost | null {
  const file = path.join(ARTICLES_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  return { id: raw.slug, ...raw } as BlogPost;
}

// Articles live at root-level URLs, so slugs must not collide with pages.
const RESERVED_SLUGS = new Set([
  "about", "admin", "api", "community", "compare", "deals", "grow-guides",
  "help", "privacy", "robots.txt", "seed-banks", "sitemap", "sitemap.xml",
  "sitemaps", "strains", "terms",
]);

export function savePost(input: PostInput, { isNew }: { isNew: boolean }): { slug: string } {
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  const slug = input.slug?.trim() || slugify(input.title);
  if (!slug) throw new Error("Could not derive a slug from the title");
  if (RESERVED_SLUGS.has(slug))
    throw new Error(`"${slug}" is a reserved URL — pick a different slug`);
  const file = path.join(ARTICLES_DIR, `${slug}.json`);
  if (isNew && fs.existsSync(file)) throw new Error(`A post with slug "${slug}" already exists`);

  const record = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    category: input.category.trim(),
    readTime: readTimeFor(input.content),
    date: input.date,
    hue: input.hue,
    content: input.content.trim(),
    ...(input.keyword?.trim() ? { keyword: input.keyword.trim() } : {}),
    ...(input.image?.trim() ? { image: input.image.trim() } : {}),
    ...(input.metaTitle?.trim() ? { metaTitle: input.metaTitle.trim() } : {}),
  };
  fs.writeFileSync(file, JSON.stringify(record, null, 2));
  return { slug };
}

export function deletePost(slug: string): boolean {
  const file = path.join(ARTICLES_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}
