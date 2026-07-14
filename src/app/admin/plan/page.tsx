"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, PenLine, ExternalLink, Upload, FileDown, Layers } from "lucide-react";

type PlanEntry = {
  id: string;
  chapter: string;
  title: string;
  learningObjective: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  wordCount: number;
  keyword?: string;
  permalink?: string;
  status: "planned" | "published";
  slug?: string;
  batchId?: string;
  scheduledDate?: string;
};

type Batch = {
  id: string;
  name: string;
  createdAt: string;
  startDate: string;
  cadenceCount: number;
  cadencePer: "day" | "week";
};

type PostSummary = { slug: string; date: string };

const difficulties = ["Beginner", "Intermediate", "Advanced"] as const;

type Draft = {
  chapter: string;
  title: string;
  learningObjective: string;
  difficulty: PlanEntry["difficulty"];
  wordCount: number;
  keyword: string;
  permalink: string;
};

const emptyDraft: Draft = {
  chapter: "",
  title: "",
  learningObjective: "",
  difficulty: "Beginner",
  wordCount: 1000,
  keyword: "",
  permalink: "",
};

function formatDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function cadenceLabel(b: Batch) {
  return `${b.cadenceCount}/${b.cadencePer} from ${formatDate(b.startDate)}`;
}

export default function ContentPlanPage() {
  const [entries, setEntries] = useState<PlanEntry[] | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [posts, setPosts] = useState<Map<string, PostSummary>>(new Map());
  const [draft, setDraft] = useState<Draft>({ ...emptyDraft });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [importSummary, setImportSummary] = useState<{
    added: number;
    skipped: { row: number; title: string; reason: string }[];
    batch?: Batch;
  } | null>(null);
  const [importError, setImportError] = useState("");

  const todayStr = new Date().toISOString().slice(0, 10);
  const [batchName, setBatchName] = useState("");
  const [batchStartDate, setBatchStartDate] = useState(todayStr);
  const [batchCadenceCount, setBatchCadenceCount] = useState(3);
  const [batchCadencePer, setBatchCadencePer] = useState<"day" | "week">("week");

  const [groupName, setGroupName] = useState("");
  const [groupStartDate, setGroupStartDate] = useState(todayStr);
  const [groupCadenceCount, setGroupCadenceCount] = useState(3);
  const [groupCadencePer, setGroupCadencePer] = useState<"day" | "week">("week");
  const [groupBusy, setGroupBusy] = useState(false);
  const [groupError, setGroupError] = useState("");

  const load = () => {
    fetch("/api/admin/plan")
      .then((r) => r.json())
      .then(setEntries);
    fetch("/api/admin/plan/batches")
      .then((r) => r.json())
      .then(setBatches)
      .catch(() => setBatches([]));
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((data) => {
        const all: PostSummary[] = [...(data.editable ?? []), ...(data.builtIn ?? [])];
        setPosts(new Map(all.map((p) => [p.slug, p])));
      })
      .catch(() => setPosts(new Map()));
  };
  useEffect(load, []);

  const startEdit = (e: PlanEntry) => {
    setEditingId(e.id);
    setDraft({
      chapter: e.chapter,
      title: e.title,
      learningObjective: e.learningObjective,
      difficulty: e.difficulty,
      wordCount: e.wordCount,
      keyword: e.keyword ?? "",
      permalink: e.permalink ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ ...emptyDraft });
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(editingId ? `/api/admin/plan/${editingId}` : "/api/admin/plan", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setBusy(false);
    if (res.ok) {
      cancelEdit();
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
    }
  };

  const remove = async (entry: PlanEntry) => {
    if (!confirm(`Remove "${entry.title}" from the plan?`)) return;
    await fetch(`/api/admin/plan/${entry.id}`, { method: "DELETE" });
    load();
  };

  const removeBatch = async (batch: Batch) => {
    if (
      !confirm(
        `Delete the batch "${batch.name}"? Its articles stay in the plan but lose their schedule.`
      )
    )
      return;
    await fetch(`/api/admin/plan/batches/${batch.id}`, { method: "DELETE" });
    load();
  };

  const importCsv = async (file: File) => {
    setImportError("");
    setImportSummary(null);
    const csv = await file.text();
    const body: Record<string, unknown> = { csv };
    if (batchName.trim()) {
      body.batch = {
        name: batchName.trim(),
        startDate: batchStartDate,
        cadenceCount: batchCadenceCount,
        cadencePer: batchCadencePer,
      };
    }
    const res = await fetch("/api/admin/plan/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setImportSummary(data);
      setBatchName("");
      load();
    } else {
      setImportError(data.error ?? "Import failed");
    }
  };

  const groupUngrouped = async (entryIds: string[]) => {
    if (!groupName.trim()) {
      setGroupError("Batch name is required");
      return;
    }
    setGroupBusy(true);
    setGroupError("");
    const res = await fetch("/api/admin/plan/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: groupName,
        startDate: groupStartDate,
        cadenceCount: groupCadenceCount,
        cadencePer: groupCadencePer,
        entryIds,
      }),
    });
    setGroupBusy(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setGroupName("");
      load();
    } else {
      setGroupError(data.error ?? "Grouping failed");
    }
  };

  const downloadTemplate = () => {
    const template =
      "Chapter,Article Title,Learning Objective,Difficulty,Word Count,Keyword,Permalink\n" +
      'Getting Started,"How to Germinate Cannabis Seeds","Reader can germinate seeds with a 90%+ success rate using the paper towel method",Beginner,1200,how to germinate cannabis seeds,how-to-germinate-cannabis-seeds\n' +
      'Harvest,"When to Harvest: Reading Trichomes","Reader can judge harvest timing by trichome color with a loupe",Intermediate,1000,when to harvest cannabis,when-to-harvest-cannabis\n';
    const url = URL.createObjectURL(new Blob([template], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "content-plan-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const planned = entries?.filter((e) => e.status === "planned") ?? [];
  const published = entries?.filter((e) => e.status === "published") ?? [];

  const label = "block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400";
  const input =
    "mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-600";

  const statusBadge = (e: PlanEntry) => {
    if (e.status === "planned") {
      return (
        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">
          {e.scheduledDate ? `Scheduled to write — ${formatDate(e.scheduledDate)}` : "Planned"}
        </span>
      );
    }
    const post = e.slug ? posts.get(e.slug) : undefined;
    if (post && post.date > todayStr) {
      return (
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
          Scheduled for {formatDate(post.date)}
        </span>
      );
    }
    return e.slug ? (
      <Link
        href={`/${e.slug}`}
        target="_blank"
        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
      >
        Published <ExternalLink size={11} />
      </Link>
    ) : (
      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
        Published
      </span>
    );
  };

  const entryRow = (e: PlanEntry, dim: boolean) => (
    <tr key={e.id} className={`align-top hover:bg-neutral-50/60 ${dim ? "bg-neutral-50/40" : ""}`}>
      <td className={`px-3 py-2 whitespace-nowrap ${dim ? "text-neutral-400" : "text-neutral-500"}`}>
        {e.chapter}
      </td>
      <td className={`px-3 py-2 font-medium ${dim ? "text-neutral-500" : "text-neutral-900"}`}>
        {e.title}
      </td>
      <td className={`max-w-sm px-3 py-2 ${dim ? "text-neutral-400" : "text-neutral-500"}`}>
        <span className="line-clamp-2">{e.learningObjective}</span>
      </td>
      <td className="px-3 py-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
            e.difficulty === "Beginner"
              ? "bg-emerald-50 text-emerald-700"
              : e.difficulty === "Intermediate"
                ? "bg-amber-50 text-amber-700"
                : "bg-rose-50 text-rose-700"
          }`}
        >
          {e.difficulty}
        </span>
      </td>
      <td className={`px-3 py-2 tabular-nums ${dim ? "text-neutral-400" : "text-neutral-500"}`}>
        ~{e.wordCount.toLocaleString()}
      </td>
      <td className={`px-3 py-2 ${dim ? "text-neutral-400" : "text-neutral-500"}`}>
        {e.keyword ?? "—"}
      </td>
      <td className={`max-w-[160px] truncate px-3 py-2 font-mono text-xs ${dim ? "text-neutral-300" : "text-neutral-400"}`}>
        {e.permalink ?? "—"}
      </td>
      <td className="px-3 py-2">{statusBadge(e)}</td>
      <td className="px-3 py-2">
        <div className="flex items-center justify-end gap-3 text-neutral-400">
          {e.status === "planned" && (
            <Link
              href={`/admin/new?plan=${e.id}`}
              title="Write this post"
              className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <PenLine size={13} /> Write
            </Link>
          )}
          {e.status === "planned" && (
            <button onClick={() => startEdit(e)} title="Edit" className="hover:text-emerald-700">
              <Pencil size={15} />
            </button>
          )}
          <button onClick={() => remove(e)} title="Delete" className="hover:text-red-600">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );

  const headerRow = (
    <thead className="bg-neutral-50 text-[11px] uppercase tracking-[0.12em] text-neutral-400">
      <tr>
        <th className="px-3 py-2 font-semibold">Chapter</th>
        <th className="px-3 py-2 font-semibold">Article Title</th>
        <th className="px-3 py-2 font-semibold">Learning Objective</th>
        <th className="px-3 py-2 font-semibold">Difficulty</th>
        <th className="px-3 py-2 font-semibold">Word Count</th>
        <th className="px-3 py-2 font-semibold">Keyword</th>
        <th className="px-3 py-2 font-semibold">Permalink</th>
        <th className="px-3 py-2 font-semibold">Status</th>
        <th className="px-3 py-2 text-right font-semibold">Actions</th>
      </tr>
    </thead>
  );

  const allGrouped = [...planned, ...published];
  const entriesByBatch = new Map<string, PlanEntry[]>();
  const ungrouped: PlanEntry[] = [];
  for (const e of allGrouped) {
    if (e.batchId) {
      const list = entriesByBatch.get(e.batchId) ?? [];
      list.push(e);
      entriesByBatch.set(e.batchId, list);
    } else {
      ungrouped.push(e);
    }
  }
  const sortedBatches = [...batches].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

  return (
    <div>
      <nav className="mb-6 text-xs text-neutral-400">
        <Link href="/admin" className="hover:text-emerald-700">
          Blog Posts
        </Link>{" "}
        / Content Plan
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Content Plan</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {entries ? `${planned.length} planned · ${published.length} published` : "Loading…"}
            {batches.length > 0 && ` · ${batches.length} scheduled batch${batches.length === 1 ? "" : "es"}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
          >
            <FileDown size={15} /> CSV template
          </button>
          <button
            onClick={() => fileInput.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            <Upload size={15} /> Import CSV
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importCsv(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Batch scheduling — applies to whichever CSV you import next */}
      <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
          <Layers size={13} /> Group this import into a scheduled batch (optional)
        </p>
        <p className="mt-1.5 text-xs text-neutral-400">
          Give the next CSV import a batch name and a release cadence. Each row gets a computed
          target date, spread out in order. Writing an article with that date auto-publishes it —
          it goes live on its own once the date arrives, no extra step. Leave the name blank to
          import ungrouped, as before.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="sm:col-span-2">
            <label className={label}>Batch name</label>
            <input
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. Beginner Series — Q3"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Start date</label>
            <input
              type="date"
              value={batchStartDate}
              onChange={(e) => setBatchStartDate(e.target.value)}
              className={input}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Cadence</label>
              <input
                type="number"
                min={1}
                max={50}
                value={batchCadenceCount}
                onChange={(e) => setBatchCadenceCount(parseInt(e.target.value, 10) || 1)}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Per</label>
              <select
                value={batchCadencePer}
                onChange={(e) => setBatchCadencePer(e.target.value as "day" | "week")}
                className={input}
              >
                <option value="day">day</option>
                <option value="week">week</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {importError && (
        <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {importError}
        </div>
      )}
      {importSummary && (
        <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-5 py-4 text-sm">
          <p className="font-semibold text-emerald-800">
            Imported {importSummary.added} article{importSummary.added === 1 ? "" : "s"}
            {importSummary.skipped.length > 0 && ` · ${importSummary.skipped.length} skipped`}
            {importSummary.batch && ` · grouped into "${importSummary.batch.name}" (${cadenceLabel(importSummary.batch)})`}
          </p>
          {importSummary.skipped.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-neutral-600">
              {importSummary.skipped.map((sk) => (
                <li key={sk.row}>
                  Row {sk.row}
                  {sk.title && ` (“${sk.title}”)`}: {sk.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Add / edit form */}
      <form
        onSubmit={submit}
        className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700">
          {editingId ? "Edit planned article" : "Add to the plan"}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="sm:col-span-2 xl:col-span-2">
            <label className={label}>Article Title</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="How to…"
              className={input}
            />
          </div>
          <div className="sm:col-span-2 xl:col-span-2">
            <label className={label}>Learning Objective</label>
            <textarea
              value={draft.learningObjective}
              onChange={(e) => setDraft({ ...draft, learningObjective: e.target.value })}
              rows={1}
              placeholder="What should the reader be able to do after reading this article?"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Chapter</label>
            <input
              value={draft.chapter}
              onChange={(e) => setDraft({ ...draft, chapter: e.target.value })}
              placeholder="e.g. Getting Started"
              className={input}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Difficulty</label>
              <select
                value={draft.difficulty}
                onChange={(e) =>
                  setDraft({ ...draft, difficulty: e.target.value as PlanEntry["difficulty"] })
                }
                className={input}
              >
                {difficulties.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Word Count</label>
              <input
                type="number"
                min={100}
                max={10000}
                step={50}
                value={draft.wordCount}
                onChange={(e) =>
                  setDraft({ ...draft, wordCount: parseInt(e.target.value, 10) || 0 })
                }
                className={input}
              />
            </div>
          </div>
          <div>
            <label className={label}>Keyword (optional)</label>
            <input
              value={draft.keyword}
              onChange={(e) => setDraft({ ...draft, keyword: e.target.value })}
              placeholder="target search keyword"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Permalink (optional)</label>
            <input
              value={draft.permalink}
              onChange={(e) => setDraft({ ...draft, permalink: e.target.value })}
              placeholder="custom-url-slug"
              className={input}
            />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex items-center gap-4">
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Plus size={15} /> {editingId ? "Save Changes" : "Add Article"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-neutral-500 hover:text-neutral-900"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {entries === null && (
        <div className="mt-6 rounded-xl border border-neutral-200 px-4 py-8 text-center text-neutral-400">
          Loading…
        </div>
      )}
      {entries?.length === 0 && (
        <div className="mt-6 rounded-xl border border-neutral-200 px-4 py-10 text-center text-neutral-400">
          Nothing planned yet — add your first article above, or import a CSV.
        </div>
      )}

      {/* Scheduled batches */}
      {sortedBatches.map((batch) => {
        const batchEntries = entriesByBatch.get(batch.id) ?? [];
        if (batchEntries.length === 0) return null;
        const batchPublished = batchEntries.filter((e) => e.status === "published").length;
        return (
          <div key={batch.id} className="mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <Layers size={14} className="text-emerald-600" /> {batch.name}
                </h2>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {cadenceLabel(batch)} · {batchEntries.length} article
                  {batchEntries.length === 1 ? "" : "s"} · {batchPublished} written
                </p>
              </div>
              <button
                onClick={() => removeBatch(batch)}
                className="text-xs font-medium text-neutral-400 hover:text-red-600"
              >
                Ungroup batch
              </button>
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full min-w-[900px] text-left text-[13px]">
                {headerRow}
                <tbody className="divide-y divide-neutral-100">
                  {batchEntries
                    .sort((a, b) => (a.scheduledDate ?? "") < (b.scheduledDate ?? "") ? -1 : 1)
                    .map((e) => entryRow(e, e.status === "published"))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Ungrouped entries — includes everything imported before batches existed */}
      {ungrouped.length > 0 && (
        <div className="mt-8">
          {sortedBatches.length > 0 && (
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              Ungrouped
            </h2>
          )}

          <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              <Layers size={13} /> Group these {ungrouped.length} entries into a scheduled batch
            </p>
            <p className="mt-1.5 text-xs text-neutral-400">
              Applies to all {ungrouped.length} ungrouped entries above, in their current order.
              Already-published ones just join the batch for reporting; only unwritten ones get a
              computed target date.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="sm:col-span-2">
                <label className={label}>Batch name</label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Full Content Plan"
                  className={input}
                />
              </div>
              <div>
                <label className={label}>Start date</label>
                <input
                  type="date"
                  value={groupStartDate}
                  onChange={(e) => setGroupStartDate(e.target.value)}
                  className={input}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Cadence</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={groupCadenceCount}
                    onChange={(e) => setGroupCadenceCount(parseInt(e.target.value, 10) || 1)}
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>Per</label>
                  <select
                    value={groupCadencePer}
                    onChange={(e) => setGroupCadencePer(e.target.value as "day" | "week")}
                    className={input}
                  >
                    <option value="day">day</option>
                    <option value="week">week</option>
                  </select>
                </div>
              </div>
            </div>
            {groupError && <p className="mt-3 text-sm text-red-600">{groupError}</p>}
            <button
              onClick={() => groupUngrouped(ungrouped.map((e) => e.id))}
              disabled={groupBusy}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <Layers size={15} /> {groupBusy ? "Grouping…" : `Group All ${ungrouped.length}`}
            </button>
          </div>

          <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full min-w-[900px] text-left text-[13px]">
              {headerRow}
              <tbody className="divide-y divide-neutral-100">
                {ungrouped.map((e) => entryRow(e, e.status === "published"))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
