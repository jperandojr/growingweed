import { NextRequest, NextResponse } from "next/server";
import { deleteBatch } from "@/lib/article-plan";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!deleteBatch(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
