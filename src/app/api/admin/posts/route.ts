import { NextRequest, NextResponse } from "next/server";
import { listEditablePosts, savePost, validatePost, PostInput } from "@/lib/admin-posts";
import { markPlanPublished } from "@/lib/article-plan";
import { getAllPosts, isPublishedNow } from "@/data/blog";
import { submitToIndexNow } from "@/lib/indexnow";

export async function GET() {
  const editable = await listEditablePosts();
  const editableSlugs = new Set(editable.map((p) => p.slug));
  const builtIn = (await getAllPosts()).filter((p) => !editableSlugs.has(p.slug));
  return NextResponse.json({ editable, builtIn });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as (PostInput & { planId?: string }) | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const error = validatePost(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    const { slug } = await savePost(body, { isNew: true });
    if (body.planId) await markPlanPublished(body.planId, slug);
    // Only ping IndexNow for content that's actually live now — a
    // scheduled/future-dated post isn't reachable yet, so submitting it
    // early would just point search engines at a 404.
    if (isPublishedNow(body)) await submitToIndexNow([`/${slug}`]);
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message) }, { status: 409 });
  }
}
