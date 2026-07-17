"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SeedBank } from "@/lib/types";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ACCENT_PRESETS = [
  "text-neutral-900",
  "text-emerald-600",
  "text-emerald-800",
  "text-amber-500",
  "text-amber-600",
  "text-amber-700",
  "text-orange-600",
  "text-teal-600",
];

export function SeedBankForm({ seedBank }: { seedBank?: SeedBank }) {
  const router = useRouter();
  const isNew = !seedBank;
  const [name, setName] = useState(seedBank?.name ?? "");
  const [slug, setSlug] = useState(seedBank?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [rating, setRating] = useState(seedBank?.rating ?? 4.8);
  const [reviewCount, setReviewCount] = useState(seedBank?.reviewCount ?? 0);
  const [strainCount, setStrainCount] = useState(seedBank?.strainCount ?? 0);
  const [freeSeeds, setFreeSeeds] = useState(seedBank?.freeSeeds ?? false);
  const [worldwideShipping, setWorldwideShipping] = useState(seedBank?.worldwideShipping ?? true);
  const [established, setEstablished] = useState(seedBank?.established ?? new Date().getFullYear());
  const [description, setDescription] = useState(seedBank?.description ?? "");
  const [logo, setLogo] = useState(seedBank?.logo ?? "");
  const [url, setUrl] = useState(seedBank?.url ?? "");
  const [accent, setAccent] = useState(seedBank?.accent ?? ACCENT_PRESETS[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadError("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (res.ok) {
      setLogo(data.url);
    } else {
      setUploadError(data.error ?? "Upload failed");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body = {
      slug: slug || slugify(name),
      name,
      rating,
      reviewCount,
      strainCount,
      freeSeeds,
      worldwideShipping,
      established,
      description,
      logo: logo.trim(),
      url: url.trim(),
      accent,
    };
    const res = await fetch(isNew ? "/api/admin/seedbanks" : `/api/admin/seedbanks/${seedBank!.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/seedbanks");
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
      <div>
        <label className={label}>Name</label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="e.g. Seedsman"
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
          <label className={label}>Established (year)</label>
          <input
            type="number"
            value={established}
            onChange={(e) => setEstablished(parseInt(e.target.value, 10) || 0)}
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={label}>Rating (0-5)</label>
          <input
            type="number"
            step={0.1}
            min={0}
            max={5}
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Review count</label>
          <input
            type="number"
            min={0}
            value={reviewCount}
            onChange={(e) => setReviewCount(parseInt(e.target.value, 10) || 0)}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Strain count</label>
          <input
            type="number"
            min={0}
            value={strainCount}
            onChange={(e) => setStrainCount(parseInt(e.target.value, 10) || 0)}
            className={input}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={freeSeeds}
            onChange={(e) => setFreeSeeds(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          Free seeds
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={worldwideShipping}
            onChange={(e) => setWorldwideShipping(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          Worldwide shipping
        </label>
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="One or two sentences describing this seed bank."
          className={input}
        />
      </div>

      <div>
        <label className={label}>Logo</label>
        <div className="mt-1.5 flex items-start gap-3">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt=""
              className="h-11 w-16 shrink-0 rounded-lg border border-neutral-200 object-contain bg-white"
              onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
            />
          ) : (
            <span className="h-11 w-16 shrink-0 rounded-lg border border-dashed border-neutral-200" />
          )}
          <div className="flex-1">
            <div className="flex gap-2">
              <input
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="/logos/seed-bank.webp, or upload a file"
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
              Uploads are converted to WebP and stored in Supabase Storage. SVG logos need to be
              added to /public/logos directly and referenced by path.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className={label}>Referral URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…?affiliate-params"
          className={input}
        />
      </div>

      <div>
        <label className={label}>Wordmark accent color</label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAccent(preset)}
              title={preset}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-neutral-100 text-sm font-bold ${preset} ${
                accent === preset ? "border-emerald-600" : "border-transparent"
              }`}
            >
              A
            </button>
          ))}
          <input
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className={`${input} mt-0 max-w-[220px]`}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : isNew ? "Add Seed Bank" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/seedbanks")}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
