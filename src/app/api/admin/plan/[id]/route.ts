import { NextRequest, NextResponse } from "next/server";
import { updatePlanEntry, deletePlanEntry, validatePlanInput, PlanInput } from "@/lib/article-plan";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as PlanInput | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const error = validatePlanInput(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const entry = await updatePlanEntry(id, body);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, entry });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!(await deletePlanEntry(id))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
