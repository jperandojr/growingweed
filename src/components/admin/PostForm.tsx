"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/lib/types";

const categories = [
  "Growing Guides",
  "Growing Tips",
  "Troubleshooting",
  "Harvest",
  "Strain Guides",
  "Strain Reviews",
  "News",
];

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type PlanBrief = {
  planId: string;
  title: string;
  category: string;
  learningObjective: string;
  difficulty: string;
  suggestedWordCount: number;
  keyword?: string;
  permalink?: string;
  scheduledDate?: string;
};

export function PostForm({ post, brief }: { post?: BlogPost; brief?: PlanBrief }) {
  const router = useRouter();
  const isNew = !post;
  const [title, setTitle] = useState(post?.title ?? brief?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? brief?.permalink ?? (brief ? slugify(brief.title) : ""));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [category, setCategory] = useState(post?.category ?? brief?.category ?? categories[0]);
  const [date, setDate] = useState(
    post?.date ?? brief?.scheduledDate ?? new Date().toISOString().slice(0, 10)
  );
  const today = new Date().toISOString().slice(0, 10);
  const isScheduled = date > today;
  const [hue, setHue] = useState(post?.hue ?? 140);
  const [hueTouched, setHueTouched] = useState(!isNew);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [image, setImage] = useState(post?.image ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [keyword, setKeyword] = useState(post?.keyword ?? brief?.keyword ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const words = content.split(/\s+/).filter(Boolean).length;

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadError("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (res.ok) {
      setImage(data.url);
    } else {
      setUploadError(data.error ?? "Upload failed");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body = {
      slug: slug || slugify(title),
      title, excerpt, category, date, hue, content,
      image: image.trim(),
      keyword: keyword.trim(),
      metaTitle: metaTitle.trim(),
      ...(brief ? { planId: brief.planId } : {}),
    };
    const res = await fetch(isNew ? "/api/admin/posts" : `/api/admin/posts/${post!.slug}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
    }
  };

  const label = "block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400";
  const input =
    "mt-1.5 w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600";

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {brief && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-5 py-4 text-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700">
            Writing from the content plan
          </p>
          <p className="mt-2 text-neutral-700">
            <span className="font-semibold">Objective:</span> {brief.learningObjective}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {brief.difficulty} level · aim for ~{brief.suggestedWordCount.toLocaleString()} words
            {words > 0 && ` (currently ${words})`}
            {brief.keyword && (
              <>
                {" · target keyword: "}
                <span className="font-semibold text-emerald-700">{brief.keyword}</span>
              </>
            )}
            {brief.scheduledDate && (
              <>
                {" · scheduled for "}
                <span className="font-semibold text-emerald-700">
                  {new Date(`${brief.scheduledDate}T00:00:00Z`).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
          </p>
        </div>
      )}
      <div>
        <label className={label}>Title</label>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
            if (!hueTouched) {
              let h = 0;
              for (const ch of e.target.value) h = (h * 31 + ch.charCodeAt(0)) | 0;
              setHue(Math.abs(h) % 360);
            }
          }}
          placeholder="How to…"
          className={input}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>Slug {!isNew && "(fixed)"}</label>
          <input
            value={slug}
            disabled={!isNew}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className={`${input} disabled:bg-neutral-50 disabled:text-neutral-400`}
          />
        </div>
        <div>
          <label className={label}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
            {[...new Set([...categories, ...(category ? [category] : [])])].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>Publish date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
          <p className="mt-1.5 text-xs text-neutral-400">
            {isScheduled
              ? "In the future — this post is saved now but stays hidden from the site until this date, then goes live automatically."
              : "Today or earlier — visible on the site immediately after saving."}
          </p>
        </div>
        <div>
          <label className={label}>Cover hue ({hue})</label>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={359}
              value={hue}
              onChange={(e) => { setHueTouched(true); setHue(parseInt(e.target.value, 10)); }}
              className="w-full accent-emerald-600"
            />
            <span
              className="h-9 w-14 shrink-0 rounded-lg"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 20%, hsl(${(hue + 40) % 360} 55% 28%), hsl(${hue} 45% 16%) 70%)`,
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <label className={label}>Featured image (optional)</label>
        <div className="mt-1.5 flex items-start gap-3">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="h-11 w-16 shrink-0 rounded-lg border border-neutral-200 object-cover"
              onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
            />
          ) : (
            <span
              className="h-11 w-16 shrink-0 rounded-lg"
              style={{
                backgroundImage: `radial-gradient(circle at 30% 20%, hsl(${(hue + 40) % 360} 55% 28%), hsl(${hue} 45% 16%) 70%)`,
              }}
            />
          )}
          <div className="flex-1">
            <div className="flex gap-2">
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://…/photo.webp, or upload a file"
                className={`${input} mt-0 flex-1`}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
                className="mt-0 shrink-0 rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Upload"}
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f);
                  e.target.value = "";
                }}
              />
            </div>
            {uploadError && <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>}
            <p className="mt-1.5 text-xs text-neutral-400">
              Leave blank to use the generated cover art (cover hue above). Uploads need a writable
              filesystem — they work in local dev, but not on Vercel in production; paste an
              external URL there instead.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
          Search &amp; social metadata
        </p>
        <div className="mt-3 flex flex-col gap-4">
          <div>
            <label className={label}>Meta title</label>
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={title ? `${title} — GrowingWeed Grow Guides` : "Falls back to the post title"}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Meta description</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="One or two sentences — used for search results, social previews, and card blurbs on listing pages."
              className={input}
            />
          </div>
          <div>
            <label className={label}>Focus keyword</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. how to germinate cannabis seeds"
              className={input}
            />
          </div>
        </div>
      </div>

      <div>
        <label className={label}>
          Content — blank line between paragraphs, &quot;## &quot;/&quot;### &quot; headings, &quot;- &quot; lists,
          a &quot;TL;DR&quot; block for key takeaways, [label](/path) links · {words} words (~{Math.max(1, Math.round(words / 150))} min read)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          placeholder={"Intro paragraph…\n\n## First Section\n\nBody text with a [link to a strain](/strains/blue-dream)…"}
          className={`${input} font-mono text-[13px] leading-relaxed`}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : isNew ? (isScheduled ? "Schedule Post" : "Publish Post") : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
