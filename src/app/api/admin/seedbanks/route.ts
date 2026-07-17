import { NextRequest, NextResponse } from "next/server";
import { getSeedBanks } from "@/data/seedbanks";
import { createSeedBank, validateSeedBank, SeedBankInput } from "@/lib/admin-seedbanks";
import { revalidateSeedBankPages } from "@/lib/revalidate-strains";

export async function GET() {
  const seedBanks = await getSeedBanks();
  return NextResponse.json(seedBanks);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as SeedBankInput | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const error = validateSeedBank(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  try {
    const record = await createSeedBank(body);
    revalidateSeedBankPages(record.slug);
    return NextResponse.json({ ok: true, id: record.id, slug: record.slug });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message) }, { status: 409 });
  }
}
