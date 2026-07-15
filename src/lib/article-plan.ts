import crypto from "node:crypto";
import { readJson, writeJson } from "./json-store";

// Editorial plan storage: upcoming articles with their brief, managed from
// the admin dashboard (or bulk-imported from CSV). Entries get marked
// "published" when a post is written from them. Backed by Vercel Blob (not
// the local filesystem) so writes persist on Vercel's serverless runtime.
//
// Bulk CSV imports are grouped into a "batch" with a release cadence (e.g.
// 3/week starting Aug 1). Each entry in the batch gets a computed
// `scheduledDate`, which becomes the post's `date` when it's written — see
// getAllPosts() in src/data/blog.ts, which hides posts whose date is still
// in the future. That's what makes publishing "automatic": once a scheduled
// article is written, it goes live on its own on the scheduled date with no
// further action needed.

const PLAN_PATH = "content/article-plan.json";
const BATCHES_PATH = "content/content-batches.json";

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
  scheduledTime?: string; // HH:MM UTC, computed from the batch's daily times
};

export function listPlan(): Promise<PlanEntry[]> {
  return readJson<PlanEntry[]>(PLAN_PATH, []);
}

function writePlan(entries: PlanEntry[]): Promise<void> {
  return writeJson(PLAN_PATH, entries);
}

export type CadencePer = "day" | "week";

export type Batch = {
  id: string;
  name: string;
  createdAt: string; // ISO timestamp
  startDate: string; // YYYY-MM-DD — first entry's scheduled date
  cadenceCount: number; // e.g. 3
  cadencePer: CadencePer; // "week" -> "3 per week"
  times?: string[]; // HH:MM UTC — when set (cadencePer "day" only), each
  // day's cohort is spread across these clock times instead of all landing
  // at 00:00 UTC together; cadenceCount is forced to times.length
};

export function listBatches(): Promise<Batch[]> {
  return readJson<Batch[]>(BATCHES_PATH, []);
}

function writeBatches(batches: Batch[]): Promise<void> {
  return writeJson(BATCHES_PATH, batches);
}

/** Spreads `count` items across a cadence of `cadenceCount` per `cadencePer`,
 *  starting at `startDate`, in order. Uses floor (not round) so a same-day
 *  cadence like 3/day lands exactly 3 on day 0, 3 on day 1, etc. — round
 *  would shortchange day 0 (e.g. only 2) to keep later days on schedule. */
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
    d.setUTCDate(d.getUTCDate() + Math.floor(i * intervalDays));
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export type ScheduleEntry = { date: string; time?: string };

/** Like computeScheduleDates, but when `times` is given (daily cadence
 *  only), each day's cohort is spread across those clock times in order
 *  instead of all landing at the same instant — e.g. times ["06:00",
 *  "09:00", "12:00"] gives 3 slots/day, cycling through the list. Falls
 *  back to computeScheduleDates (no time-of-day) when times is omitted. */
export function computeSchedule(
  startDate: string,
  cadencePer: CadencePer,
  count: number,
  opts: { cadenceCount: number; times?: string[] }
): ScheduleEntry[] {
  const times = opts.times?.filter(Boolean);
  if (cadencePer === "day" && times && times.length > 0) {
    const start = new Date(`${startDate}T00:00:00Z`);
    const out: ScheduleEntry[] = [];
    for (let i = 0; i < count; i++) {
      const dayOffset = Math.floor(i / times.length);
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + dayOffset);
      out.push({ date: d.toISOString().slice(0, 10), time: times[i % times.length] });
    }
    return out;
  }
  return computeScheduleDates(startDate, opts.cadenceCount, cadencePer, count).map((date) => ({
    date,
  }));
}

export async function deleteBatch(id: string): Promise<boolean> {
  const batches = await listBatches();
  const next = batches.filter((b) => b.id !== id);
  if (next.length === batches.length) return false;
  await writeBatches(next);
  // Unlink member entries rather than deleting them.
  const entries = await listPlan();
  let touched = false;
  for (const e of entries) {
    if (e.batchId === id) {
      delete e.batchId;
      delete e.scheduledDate;
      delete e.scheduledTime;
      touched = true;
    }
  }
  if (touched) await writePlan(entries);
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

export async function addPlanEntry(input: PlanInput): Promise<PlanEntry> {
  const entries = await listPlan();
  const entry: PlanEntry = {
    id: crypto.randomUUID().slice(0, 8),
    ...toEntry(input),
    status: "planned",
  };
  entries.push(entry);
  await writePlan(entries);
  return entry;
}

export async function updatePlanEntry(id: string, input: PlanInput): Promise<PlanEntry | null> {
  const entries = await listPlan();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  entries[idx] = { ...entries[idx], ...toEntry(input) };
  await writePlan(entries);
  return entries[idx];
}

export async function deletePlanEntry(id: string): Promise<boolean> {
  const entries = await listPlan();
  const next = entries.filter((e) => e.id !== id);
  if (next.length === entries.length) return false;
  await writePlan(next);
  return true;
}

/** Called when a post is created from a plan entry. */
export async function markPlanPublished(id: string, slug: string): Promise<void> {
  const entries = await listPlan();
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;
  entry.status = "published";
  entry.slug = slug;
  await writePlan(entries);
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
  times?: string[]; // HH:MM UTC, daily cadence only — see Batch.times
};

/** Bulk-add entries (from CSV import). Skips invalid rows and duplicate
 *  titles (case-insensitive, against both existing plan and this batch).
 *  When `batchInput` is given, all added rows are grouped into a new batch
 *  and get a `scheduledDate` computed from its release cadence, in the same
 *  order they appear in the CSV. */
export async function importPlanEntries(
  rows: { rowNumber: number; input: Partial<PlanInput> }[],
  batchInput?: ImportBatchInput
): Promise<ImportResult> {
  const entries = await listPlan();
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
    const times =
      batchInput.cadencePer === "day" ? batchInput.times?.filter(Boolean) : undefined;
    batch = {
      id: crypto.randomUUID().slice(0, 8),
      name: batchInput.name.trim(),
      createdAt: new Date().toISOString(),
      startDate: batchInput.startDate,
      cadenceCount: times && times.length > 0 ? times.length : batchInput.cadenceCount,
      cadencePer: batchInput.cadencePer,
      ...(times && times.length > 0 ? { times } : {}),
    };
    const schedule = computeSchedule(batch.startDate, batch.cadencePer, added.length, {
      cadenceCount: batch.cadenceCount,
      times: batch.times,
    });
    added.forEach((e, i) => {
      e.batchId = batch!.id;
      e.scheduledDate = schedule[i].date;
      if (schedule[i].time) e.scheduledTime = schedule[i].time;
    });
    const batches = await listBatches();
    batches.push(batch);
    await writeBatches(batches);
  }

  if (added.length > 0) await writePlan([...entries, ...added]);
  return { added: added.length, skipped, batch };
}

/** Retroactively group existing plan entries (e.g. from an import that
 *  predates batching) into a new batch. Only entries with status "planned"
 *  get a computed `scheduledDate` — already-published entries just join the
 *  batch for grouping/reporting, keeping their real publish date on the
 *  post itself rather than getting an overwritten one. Order follows the
 *  entries' existing order in the plan. */
export async function groupExistingEntries(
  entryIds: string[],
  batchInput: ImportBatchInput
): Promise<Batch> {
  const entries = await listPlan();
  const idSet = new Set(entryIds);
  const targeted = entries.filter((e) => idSet.has(e.id));
  if (targeted.length === 0) throw new Error("No matching plan entries");

  const times = batchInput.cadencePer === "day" ? batchInput.times?.filter(Boolean) : undefined;
  const batch: Batch = {
    id: crypto.randomUUID().slice(0, 8),
    name: batchInput.name.trim(),
    createdAt: new Date().toISOString(),
    startDate: batchInput.startDate,
    cadenceCount: times && times.length > 0 ? times.length : batchInput.cadenceCount,
    cadencePer: batchInput.cadencePer,
    ...(times && times.length > 0 ? { times } : {}),
  };

  const plannedCount = targeted.filter((e) => e.status === "planned").length;
  const schedule = computeSchedule(batch.startDate, batch.cadencePer, plannedCount, {
    cadenceCount: batch.cadenceCount,
    times: batch.times,
  });
  let di = 0;
  for (const e of entries) {
    if (!idSet.has(e.id)) continue;
    e.batchId = batch.id;
    if (e.status === "planned") {
      e.scheduledDate = schedule[di].date;
      if (schedule[di].time) e.scheduledTime = schedule[di].time;
      di++;
    }
  }

  const batches = await listBatches();
  batches.push(batch);
  await writeBatches(batches);
  await writePlan(entries);
  return batch;
}
