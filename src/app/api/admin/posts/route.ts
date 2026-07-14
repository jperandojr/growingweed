import { NextRequest, NextResponse } from "next/server";
import { listEditablePosts, savePost, validatePost, PostInput } from "@/lib/admin-posts";
import { markPlanPublished } from "@/lib/article-plan";
import { getAllPosts } from "@/data/blog";

export function GET() {
  const editable = listEditablePosts();
  const editableSlugs = new Set(editable.map((p) => p.slug));
  const builtIn = getAllPosts().filter((p) => !editableSlugs.has(p.slug));
  return NextResponse.json({ editable, builtIn });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as (PostInput & { planId?: string }) | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const error = validatePost(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    const { slug } = savePost(body, { isNew: true });
    if (body.planId) markPlanPublished(body.planId, slug);
    return NextResponse.json({ ok: true, slug });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message) }, { status: 409 });
  }
}
