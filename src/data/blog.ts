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

/** Public posts, newest first, excluding anything whose date+time (UTC) is
 *  still in the future. A post written with a future `date`/`publishTime`
 *  (e.g. from a scheduled content-plan batch) stays hidden until that
 *  moment arrives — no publish step needed, it just becomes visible on its
 *  own. `publishTime` defaults to 00:00 UTC when omitted (start of `date`),
 *  matching pre-time-of-day behavior. Reads the articles directory on every
 *  call so newly written/now-due files appear without a restart (in
 *  dev/dynamic rendering). */
export function getAllPosts(): BlogPost[] {
  const now = Date.now();
  return loadPublishedArticles()
    .map((post) => ({
      post,
      publishAt: new Date(`${post.date}T${post.publishTime ?? "00:00"}:00Z`).getTime(),
    }))
    .filter((x) => x.publishAt <= now)
    .sort((a, b) => b.publishAt - a.publishAt)
    .map((x) => x.post);
}

export function getPostBySlug(slug: string) {
  return getAllPosts().find((p) => p.slug === slug);
}
