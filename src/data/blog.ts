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

/** Whether a post's date+time (UTC) has arrived. `publishTime` defaults to
 *  00:00 UTC when omitted (start of `date`). */
export function isPublishedNow(post: { date: string; publishTime?: string }): boolean {
  return new Date(`${post.date}T${post.publishTime ?? "00:00"}:00Z`).getTime() <= Date.now();
}

/** Public posts, newest first, excluding anything whose date+time (UTC) is
 *  still in the future. A post written with a future `date`/`publishTime`
 *  (e.g. from a scheduled content-plan batch) stays hidden until that
 *  moment arrives — no publish step needed, it just becomes visible on its
 *  own. Reads the articles directory on every call so newly written/now-due
 *  files appear without a restart (in dev/dynamic rendering). */
export function getAllPosts(): BlogPost[] {
  return loadPublishedArticles()
    .filter(isPublishedNow)
    .sort((a, b) =>
      new Date(`${b.date}T${b.publishTime ?? "00:00"}:00Z`).getTime() -
      new Date(`${a.date}T${a.publishTime ?? "00:00"}:00Z`).getTime()
    );
}

export function getPostBySlug(slug: string) {
  return getAllPosts().find((p) => p.slug === slug);
}
