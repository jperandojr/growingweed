import { BlogPost } from "@/lib/types";
import { listEditablePosts } from "@/lib/admin-posts";

/** Whether a post's date+time (UTC) has arrived. `publishTime` defaults to
 *  00:00 UTC when omitted (start of `date`). */
export function isPublishedNow(post: { date: string; publishTime?: string }): boolean {
  return new Date(`${post.date}T${post.publishTime ?? "00:00"}:00Z`).getTime() <= Date.now();
}

/** Public posts, newest first, excluding anything whose date+time (UTC) is
 *  still in the future. A post written with a future `date`/`publishTime`
 *  (e.g. from a scheduled content-plan batch) stays hidden until that
 *  moment arrives — no publish step needed, it just becomes visible on its
 *  own. Reads from Blob on every call so newly written/now-due posts appear
 *  without a redeploy. */
export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await listEditablePosts();
  return posts
    .filter(isPublishedNow)
    .sort((a, b) =>
      new Date(`${b.date}T${b.publishTime ?? "00:00"}:00Z`).getTime() -
      new Date(`${a.date}T${a.publishTime ?? "00:00"}:00Z`).getTime()
    );
}

export async function getPostBySlug(slug: string) {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug);
}
