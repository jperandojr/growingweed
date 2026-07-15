import { NextRequest, NextResponse } from "next/server";
import {
  listBatches,
  listPlan,
  groupExistingEntries,
  CadencePer,
} from "@/lib/article-plan";

export async function GET() {
  return NextResponse.json(await listBatches());
}

// Retroactively group existing plan entries into a new scheduled batch.
// Defaults to every entry not already in a batch when entryIds is omitted.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    startDate?: string;
    cadenceCount?: number;
    cadencePer?: CadencePer;
    times?: string[];
    entryIds?: string[];
  } | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  if (!body.name?.trim())
    return NextResponse.json({ error: "Batch name is required" }, { status: 400 });
  if (!body.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.startDate))
    return NextResponse.json({ error: "Start date must be YYYY-MM-DD" }, { status: 400 });
  if (body.cadencePer !== "day" && body.cadencePer !== "week")
    return NextResponse.json({ error: "Cadence period must be 'day' or 'week'" }, { status: 400 });
  const times = body.cadencePer === "day" ? body.times?.filter(Boolean) : undefined;
  if (times && times.some((t) => !/^\d{2}:\d{2}$/.test(t)))
    return NextResponse.json({ error: "Publish times must be HH:MM" }, { status: 400 });
  if (!times?.length && (!body.cadenceCount || body.cadenceCount < 1))
    return NextResponse.json({ error: "Cadence count must be at least 1" }, { status: 400 });

  let entryIds = body.entryIds;
  if (!entryIds || entryIds.length === 0) {
    const plan = await listPlan();
    entryIds = plan.filter((e) => !e.batchId).map((e) => e.id);
  }
  if (entryIds.length === 0)
    return NextResponse.json({ error: "No ungrouped entries to group" }, { status: 400 });

  try {
    const batch = await groupExistingEntries(entryIds, {
      name: body.name,
      startDate: body.startDate,
      cadenceCount: body.cadenceCount ?? 1,
      cadencePer: body.cadencePer,
      ...(times?.length ? { times } : {}),
    });
    return NextResponse.json({ ok: true, batch, grouped: entryIds.length });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message) }, { status: 400 });
  }
}
