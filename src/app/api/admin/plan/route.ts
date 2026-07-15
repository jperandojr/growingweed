import { NextRequest, NextResponse } from "next/server";
import { listPlan, addPlanEntry, validatePlanInput, PlanInput } from "@/lib/article-plan";

export async function GET() {
  return NextResponse.json(await listPlan());
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as PlanInput | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const error = validatePlanInput(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true, entry: await addPlanEntry(body) });
}
