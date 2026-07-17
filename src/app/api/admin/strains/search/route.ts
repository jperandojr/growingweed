import { NextRequest, NextResponse } from "next/server";
import { searchStrains } from "@/lib/admin-strains";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await searchStrains(q);
  return NextResponse.json(results);
}
