import { NextRequest, NextResponse } from "next/server";
import {
  getEditablePost,
  savePost,
  deletePost,
  validatePost,
  PostInput,
} from "@/lib/admin-posts";

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
  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  if (!deletePost(slug)) {
    return NextResponse.json({ error: "Not found (built-in posts are read-only)" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
