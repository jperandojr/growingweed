import { NextRequest, NextResponse } from "next/server";
import { getStrainBySlug } from "@/data/strains";
import { validateStrain, saveStrainEdit } from "@/lib/admin-strains";
import { revalidateStrainPages } from "@/lib/revalidate-strains";
import { Strain } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const strain = await getStrainBySlug(slug);
  if (!strain) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(strain);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const existing = await getStrainBySlug(slug);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json().catch(() => null)) as Partial<Strain> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  // id and slug are fixed at edit time — this is "edit existing", not "rename".
  const merged: Strain = { ...existing, ...body, id: existing.id, slug: existing.slug };
  const error = validateStrain(merged);
  if (error) return NextResponse.json({ error }, { status: 400 });
  await saveStrainEdit(merged);
  revalidateStrainPages(slug);
  return NextResponse.json({ ok: true, slug });
}
