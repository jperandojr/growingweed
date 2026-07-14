import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Editorial plan storage: upcoming articles with their brief, managed from
// the admin dashboard (or bulk-imported from CSV). Entries get marked
// "published" when a post is written from them.
//
// Bulk CSV imports are grouped into a "batch" with a release cadence (e.g.
// 3/week starting Aug 1). Each entry in the batch gets a computed
// `scheduledDate`, which becomes the post's `date` when it's written — see
// getAllPosts() in src/data/blog.ts, which hides posts whose date is still
// in the future. That's what makes publishing "automatic": once a scheduled
// article is written, it goes live on its own on the scheduled date with no
// further action needed.

const PLAN_FILE = path.join(process.cwd(), "content", "article-plan.json");
const BATCHES_FILE = path.join(process.cwd(), "content", "content-batches.json");

export type PlanDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type PlanEntry = {
  id: string;
  chapter: string;
  title: string;
  learningObjective: string;
  difficulty: PlanDifficulty;
  wordCount: number;
  keyword?: string; // target SEO keyword
  permalink?: string; // desired slug for the published post
  status: "planned" | "published";
  slug?: string; // set when published
  batchId?: string; // set when imported as part of a scheduled bulk upload
  scheduledDate?: string; // YYYY-MM-DD, computed from the batch's cadence
};

export function listPlan(): PlanEntry[] {
  try {
    return JSON.parse(fs.readFileSync(PLAN_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writePlan(entries: PlanEntry[]) {
  fs.mkdirSync(path.dirname(PLAN_FILE), { recursive: true });
  fs.writeFileSync(PLAN_FILE, JSON.stringify(entries, null, 2));
}

export type CadencePer = "day" | "week";

export type Batch = {
  id: string;
  name: string;
  createdAt: string; // ISO timestamp
  startDate: string; // YYYY-MM-DD — first entry's scheduled date
  cadenceCount: number; // e.g. 3
  cadencePer: CadencePer; // "week" -> "3 per week"
};

export function listBatches(): Batch[] {
  try {
    return JSON.parse(fs.readFileSync(BATCHES_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeBatches(batches: Batch[]) {
  fs.mkdirSync(path.dirname(BATCHES_FILE), { recursive: true });
  fs.writeFileSync(BATCHES_FILE, JSON.stringify(batches, null, 2));
}

/** Spreads `count` items across a cadence of `cadenceCount` per `cadencePer`,
 *  starting at `startDate`, in order. E.g. 3/week from 2026-08-01 gives dates
 *  roughly 2.3 days apart: Aug 1, 3, 5, 8, 10, 13, ... */
export function computeScheduleDates(
  startDate: string,
  cadenceCount: number,
  cadencePer: CadencePer,
  count: number
): string[] {
  const periodDays = cadencePer === "week" ? 7 : 1;
  const intervalDays = periodDays / Math.max(1, cadenceCount);
  const start = new Date(`${startDate}T00:00:00Z`);
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + Math.round(i * intervalDays));
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function deleteBatch(id: string): boolean {
  const batches = listBatches();
  const next = batches.filter((b) => b.id !== id);
  if (next.length === batches.length) return false;
  writeBatches(next);
  // Unlink member entries rather than deleting them.
  const entries = listPlan();
  let touched = false;
  for (const e of entries) {
    if (e.batchId === id) {
      delete e.batchId;
      delete e.scheduledDate;
      touched = true;
    }
  }
  if (touched) writePlan(entries);
  return true;
}

export function slugifyPermalink(value: string): string {
  return value
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/, "") // tolerate full URLs
    .replace(/^\/?((grow-)?guides[\/-])?/, "") // tolerate path/prefix variants
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type PlanInput = {
  chapter: string;
  title: string;
  learningObjective: string;
  difficulty: PlanDifficulty;
  wordCount: number;
  keyword?: string;
  permalink?: string;
};

export function validatePlanInput(input: Partial<PlanInput>): string | null {
  if (!input.title?.trim()) return "Article title is required";
  if (!input.chapter?.trim()) return "Chapter is required";
  if (!input.learningObjective?.trim()) return "Learning objective is required";
  if (!["Beginner", "Intermediate", "Advanced"].includes(input.difficulty ?? ""))
    return "Difficulty must be Beginner, Intermediate or Advanced";
  if (typeof input.wordCount !== "number" || input.wordCount < 100 || input.wordCount > 10000)
    return "Word count must be between 100 and 10,000";
  return null;
}

function toEntry(input: PlanInput): Omit<PlanEntry, "id" | "status"> {
  const permalink = input.permalink?.trim() ? slugifyPermalink(input.permalink) : undefined;
  return {
    chapter: input.chapter.trim(),
    title: input.title.trim(),
    learningObjective: input.learningObjective.trim(),
    difficulty: input.difficulty,
    wordCount: input.wordCount,
    ...(input.keyword?.trim() ? { keyword: input.keyword.trim() } : {}),
    ...(permalink ? { permalink } : {}),
  };
}

export function addPlanEntry(input: PlanInput): PlanEntry {
  const entries = listPlan();
  const entry: PlanEntry = {
    id: crypto.randomUUID().slice(0, 8),
    ...toEntry(input),
    status: "planned",
  };
  entries.push(entry);
  writePlan(entries);
  return entry;
}

export function updatePlanEntry(id: string, input: PlanInput): PlanEntry | null {
  const entries = listPlan();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  entries[idx] = { ...entries[idx], ...toEntry(input) };
  writePlan(entries);
  return entries[idx];
}

export function deletePlanEntry(id: string): boolean {
  const entries = listPlan();
  const next = entries.filter((e) => e.id !== id);
  if (next.length === entries.length) return false;
  writePlan(next);
  return true;
}

/** Called when a post is created from a plan entry. */
export function markPlanPublished(id: string, slug: string) {
  const entries = listPlan();
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;
  entry.status = "published";
  entry.slug = slug;
  writePlan(entries);
}

export type ImportRowResult = { row: number; title: string; reason: string };

export type ImportResult = {
  added: number;
  skipped: ImportRowResult[];
  batch?: Batch;
};

export type ImportBatchInput = {
  name: string;
  startDate: string; // YYYY-MM-DD
  cadenceCount: number;
  cadencePer: CadencePer;
};

/** Bulk-add entries (from CSV import). Skips invalid rows and duplicate
 *  titles (case-insensitive, against both existing plan and this batch).
 *  When `batchInput` is given, all added rows are grouped into a new batch
 *  and get a `scheduledDate` computed from its release cadence, in the same
 *  order they appear in the CSV. */
export function importPlanEntries(
  rows: { rowNumber: number; input: Partial<PlanInput> }[],
  batchInput?: ImportBatchInput
): ImportResult {
  const entries = listPlan();
  const seenTitles = new Set(entries.map((e) => e.title.toLowerCase()));
  const skipped: ImportRowResult[] = [];
  const added: PlanEntry[] = [];

  for (const { rowNumber, input } of rows) {
    const title = input.title?.trim() ?? "";
    const error = validatePlanInput(input);
    if (error) {
      skipped.push({ row: rowNumber, title, reason: error });
      continue;
    }
    if (seenTitles.has(title.toLowerCase())) {
      skipped.push({ row: rowNumber, title, reason: "Duplicate title (already planned)" });
      continue;
    }
    seenTitles.add(title.toLowerCase());
    added.push({
      id: crypto.randomUUID().slice(0, 8),
      ...toEntry(input as PlanInput),
      status: "planned",
    });
  }

  let batch: Batch | undefined;
  if (added.length > 0 && batchInput) {
    batch = {
      id: crypto.randomUUID().slice(0, 8),
      name: batchInput.name.trim(),
      createdAt: new Date().toISOString(),
      startDate: batchInput.startDate,
      cadenceCount: batchInput.cadenceCount,
      cadencePer: batchInput.cadencePer,
    };
    const dates = computeScheduleDates(
      batch.startDate,
      batch.cadenceCount,
      batch.cadencePer,
      added.length
    );
    added.forEach((e, i) => {
      e.batchId = batch!.id;
      e.scheduledDate = dates[i];
    });
    const batches = listBatches();
    batches.push(batch);
    writeBatches(batches);
  }

  if (added.length > 0) writePlan([...entries, ...added]);
  return { added: added.length, skipped, batch };
}

/** Retroactively group existing plan entries (e.g. from an import that
 *  predates batching) into a new batch. Only entries with status "planned"
 *  get a computed `scheduledDate` — already-published entries just join the
 *  batch for grouping/reporting, keeping their real publish date on the
 *  post itself rather than getting an overwritten one. Order follows the
 *  entries' existing order in the plan. */
export function groupExistingEntries(
  entryIds: string[],
  batchInput: ImportBatchInput
): Batch {
  const entries = listPlan();
  const idSet = new Set(entryIds);
  const targeted = entries.filter((e) => idSet.has(e.id));
  if (targeted.length === 0) throw new Error("No matching plan entries");

  const batch: Batch = {
    id: crypto.randomUUID().slice(0, 8),
    name: batchInput.name.trim(),
    createdAt: new Date().toISOString(),
    startDate: batchInput.startDate,
    cadenceCount: batchInput.cadenceCount,
    cadencePer: batchInput.cadencePer,
  };

  const plannedCount = targeted.filter((e) => e.status === "planned").length;
  const dates = computeScheduleDates(
    batch.startDate,
    batch.cadenceCount,
    batch.cadencePer,
    plannedCount
  );
  let di = 0;
  for (const e of entries) {
    if (!idSet.has(e.id)) continue;
    e.batchId = batch.id;
    if (e.status === "planned") e.scheduledDate = dates[di++];
  }

  const batches = listBatches();
  batches.push(batch);
  writeBatches(batches);
  writePlan(entries);
  return batch;
}
