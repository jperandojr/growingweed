import { NextRequest } from "next/server";
import { getStrainBySlug } from "@/data/strains";

// Lookup endpoint for client pages (compare) that resolve localStorage
// slugs to strain data without shipping the full catalog to the browser.
// Capped to keep responses small.
const MAX_SLUGS = 50;

export function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("slugs") ?? "";
  const slugs = raw.split(",").filter(Boolean).slice(0, MAX_SLUGS);
  const found = slugs.flatMap((slug) => {
    const s = getStrainBySlug(slug);
    return s ? [s] : [];
  });
  return Response.json(found);
}
