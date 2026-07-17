import { NextRequest, NextResponse } from "next/server";
import { getSeedBankById } from "@/data/seedbanks";
import { updateSeedBank, deleteSeedBank, validateSeedBank, SeedBankInput } from "@/lib/admin-seedbanks";
import { revalidateSeedBankPages } from "@/lib/revalidate-strains";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const bank = await getSeedBankById(id);
  if (!bank) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bank);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as SeedBankInput | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const error = validateSeedBank(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    const record = await updateSeedBank(id, body);
    revalidateSeedBankPages(record.slug);
    return NextResponse.json({ ok: true, id: record.id, slug: record.slug });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message) }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = await getSeedBankById(id);
  if (!(await deleteSeedBank(id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  revalidateSeedBankPages(existing?.slug);
  return NextResponse.json({ ok: true });
}
