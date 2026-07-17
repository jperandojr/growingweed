import { NextResponse } from "next/server";
import { getSeedBanks } from "@/data/seedbanks";

// Public, cached lookup for client components that need seed bank data
// without pulling a server-side Supabase fetch into a page's render path
// (e.g. PurchaseProof, which only needs bank names for its toast copy).
export const revalidate = 1800;

export async function GET() {
  const seedBanks = await getSeedBanks();
  return NextResponse.json(seedBanks);
}
