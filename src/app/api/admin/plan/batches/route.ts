import { NextResponse } from "next/server";
import { listBatches } from "@/lib/article-plan";

export function GET() {
  return NextResponse.json(listBatches());
}
