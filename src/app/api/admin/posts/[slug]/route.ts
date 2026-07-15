import { NextRequest, NextResponse } from "next/server";
import {
  getEditablePost,
  savePost,
  deletePost,
  validatePost,
  PostInput,
} from "@/lib/admin-posts";
import { isPublishedNow } from "@/data/blog";
import { submitToIndexNow } from "@/lib/indexnow";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const post = getEditablePost(slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  if (!getEditablePost(slug)) {
    return NextResponse.json({ error: "Not found (built-in posts are read-only)" }, { status: 404 });
  }
  const body = (await req.json().catch(() => null)) as PostInput | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const error = validatePost(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  savePost({ ...body, slug }, { isNew: false });
  // Only ping for edits that are live now — see the note in the POST route.
  if (isPublishedNow(body)) await submitToIndexNow([`/${slug}`]);
  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const existing = getEditablePost(slug);
  if (!deletePost(slug)) {
    return NextResponse.json({ error: "Not found (built-in posts are read-only)" }, { status: 404 });
  }
  // Prompt a recrawl of the now-gone URL so it drops out of search faster,
  // but only if it was actually live (no point recrawling a page that was
  // never reachable).
  if (existing && isPublishedNow(existing)) await submitToIndexNow([`/${slug}`]);
  return NextResponse.json({ ok: true });
}
