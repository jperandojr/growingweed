import fs from "node:fs";
import path from "node:path";
import { BlogPost } from "@/lib/types";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

function loadPublishedArticles(): BlogPost[] {
  try {
    return fs
      .readdirSync(ARTICLES_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const raw = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), "utf8"));
        return { id: raw.slug, ...raw } as BlogPost;
      });
  } catch {
    return []; // directory missing or unreadable — founding posts only
  }
}

/** Public posts, newest first, excluding anything dated in the future. A
 *  post written with a future `date` (e.g. from a scheduled content-plan
 *  batch) stays hidden until that date arrives — no publish step needed,
 *  it just becomes visible on its own once `date` is today or earlier.
 *  Reads the articles directory on every call so newly written/now-due
 *  files appear without a restart (in dev/dynamic rendering). */
export function getAllPosts(): BlogPost[] {
  const today = new Date().toISOString().slice(0, 10);
  return loadPublishedArticles()
    .filter((p) => p.date <= today)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string) {
  return getAllPosts().find((p) => p.slug === slug);
}
