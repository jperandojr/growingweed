import { NextRequest } from "next/server";
import { getStrainBySlug } from "@/data/strains";

// Lookup endpoint for client pages (compare) that resolve localStorage
// slugs to strain data without shipping the full catalog to the browser.
// Capped to keep responses small.
const MAX_SLUGS = 50;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = raw.split(",").filter(Boolean).slice(0, MAX_SLUGS);
  const results = await Promise.all(slugs.map(getStrainBySlug));
  const found = results.filter((s): s is NonNullable<typeof s> => !!s);
  return Response.json(found);
}
