import { NextRequest, NextResponse } from "next/server";
import { parseCsv } from "@/lib/csv";
import {
  importPlanEntries,
  PlanDifficulty,
  PlanInput,
  ImportBatchInput,
  CadencePer,
} from "@/lib/article-plan";

// CSV bulk import for the content plan.
// Expected headers (order-independent, case/spacing-insensitive):
//   Chapter, Article Title, Learning Objective, Difficulty, Word Count, Keyword, Permalink
// Keyword and Permalink are optional columns.

const HEADER_ALIASES: Record<string, keyof PlanInput> = {
  chapter: "chapter",
  category: "chapter", // accept the old header too
  articletitle: "title",
  title: "title",
  learningobjective: "learningObjective",
  objective: "learningObjective",
  difficulty: "difficulty",
  wordcount: "wordCount",
  suggestedwordcount: "wordCount",
  suggestedwords: "wordCount",
  words: "wordCount",
  keyword: "keyword",
  targetkeyword: "keyword",
  focuskeyword: "keyword",
  permalink: "permalink",
  slug: "permalink",
  url: "permalink",
};

const REQUIRED: (keyof PlanInput)[] = [
  "chapter",
  "title",
  "learningObjective",
  "difficulty",
  "wordCount",
];

function normalizeHeader(h: string) {
  return h.toLowerCase().replace(/[^a-z]/g, "");
}

function normalizeDifficulty(v: string): PlanDifficulty | undefined {
  const d = v.trim().toLowerCase();
  if (d === "beginner") return "Beginner";
  if (d === "intermediate") return "Intermediate";
  if (d === "advanced") return "Advanced";
  return undefined;
}

export async function POST(req: NextRequest) {
  const { csv, batch } = (await req.json().catch(() => ({}))) as {
    csv?: string;
    batch?: { name?: string; startDate?: string; cadenceCount?: number; cadencePer?: CadencePer };
  };
  if (!csv?.trim()) {
    return NextResponse.json({ error: "No CSV content provided" }, { status: 400 });
  }

  let batchInput: ImportBatchInput | undefined;
  if (batch) {
    if (!batch.name?.trim())
      return NextResponse.json({ error: "Batch name is required" }, { status: 400 });
    if (!batch.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(batch.startDate))
      return NextResponse.json({ error: "Batch start date must be YYYY-MM-DD" }, { status: 400 });
    if (!batch.cadenceCount || batch.cadenceCount < 1)
      return NextResponse.json({ error: "Cadence count must be at least 1" }, { status: 400 });
    if (batch.cadencePer !== "day" && batch.cadencePer !== "week")
      return NextResponse.json({ error: "Cadence period must be 'day' or 'week'" }, { status: 400 });
    batchInput = {
      name: batch.name,
      startDate: batch.startDate,
      cadenceCount: batch.cadenceCount,
      cadencePer: batch.cadencePer,
    };
  }

  const rows = parseCsv(csv);
  if (rows.length < 2) {
    return NextResponse.json(
      { error: "CSV needs a header row and at least one data row" },
      { status: 400 }
    );
  }

  const columnMap = new Map<number, keyof PlanInput>();
  rows[0].forEach((h, i) => {
    const field = HEADER_ALIASES[normalizeHeader(h)];
    if (field && ![...columnMap.values()].includes(field)) columnMap.set(i, field);
  });
  const found = new Set(columnMap.values());
  const missing = REQUIRED.filter((f) => !found.has(f));
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error:
          `Missing column(s): ${missing.join(", ")}. ` +
          `Expected headers: Chapter, Article Title, Learning Objective, Difficulty, Word Count, Keyword, Permalink`,
      },
      { status: 400 }
    );
  }

  const parsed = rows.slice(1).map((cells, i) => {
    const input: Partial<PlanInput> = {};
    for (const [col, field] of columnMap) {
      const value = (cells[col] ?? "").trim();
      if (field === "wordCount") {
        const digits = value.replace(/[^\d]/g, "");
        input.wordCount = digits ? parseInt(digits, 10) : undefined;
      } else if (field === "difficulty") {
        input.difficulty = normalizeDifficulty(value);
      } else {
        input[field] = value;
      }
    }
    return { rowNumber: i + 2, input }; // +2: header is row 1
  });

  const result = importPlanEntries(parsed, batchInput);
  return NextResponse.json(result);
}
