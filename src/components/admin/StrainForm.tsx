"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Strain, StrainType, Badge, SeedBank } from "@/lib/types";

const BADGES: Badge[] = [
  "Bestseller",
  "Top Rated",
  "High THC",
  "Fast Flowering",
  "High Yield",
  "CBD Rich",
  "New",
];
const STRAIN_TYPES: StrainType[] = ["Feminized", "Autoflower", "Regular"];
const DIFFICULTIES: Strain["difficulty"][] = ["Beginner", "Intermediate", "Expert"];
const FLOWERING_SPEEDS: Strain["floweringSpeed"][] = ["Fast Flowering", "Standard"];

function csv(values: string[]) {
  return values.join(", ");
}
function parseCsv(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function StrainForm({ strain }: { strain: Strain }) {
  const router = useRouter();
  const [seedBanks, setSeedBanks] = useState<SeedBank[]>([]);
  const [name, setName] = useState(strain.name);
  const [thc, setThc] = useState(strain.thc);
  const [cbd, setCbd] = useState(strain.cbd);
  const [badge, setBadge] = useState<Badge | "">(strain.badge ?? "");
  const [rating, setRating] = useState(strain.rating);
  const [reviewCount, setReviewCount] = useState(strain.reviewCount);
  const [offers, setOffers] = useState(strain.offers);
  const [effectsText, setEffectsText] = useState(csv(strain.effects));
  const [flavorsText, setFlavorsText] = useState(csv(strain.flavors));
  const [categoryText, setCategoryText] = useState(csv(strain.category));
  const [environment, setEnvironment] = useState<Strain["environment"]>(strain.environment);
  const [difficulty, setDifficulty] = useState(strain.difficulty);
  const [floweringSpeed, setFloweringSpeed] = useState(strain.floweringSpeed);
  const [description, setDescription] = useState(strain.description);
  const [hue, setHue] = useState(strain.hue);
  const [heritage, setHeritage] = useState(strain.heritage ?? "");
  const [image, setImage] = useState(strain.image ?? "");
  const [imagesText, setImagesText] = useState((strain.images ?? []).join("\n"));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/seedbanks")
      .then((r) => r.json())
      .then(setSeedBanks)
      .catch(() => setSeedBanks([]));
  }, []);

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

  const toggleEnvironment = (v: "Indoor" | "Outdoor") => {
    setEnvironment((prev) =>
      prev.includes(v) ? prev.filter((e) => e !== v) : [...prev, v]
    );
  };

  const updateOffer = (i: number, patch: Partial<Strain["offers"][number]>) => {
    setOffers((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  };
  const removeOffer = (i: number) => {
    setOffers((prev) => prev.filter((_, idx) => idx !== i));
  };
  const addOffer = () => {
    setOffers((prev) => [
      ...prev,
      { seedBankId: seedBanks[0]?.id ?? "", price: 0, type: "Feminized" as StrainType },
    ]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body: Partial<Strain> = {
      name,
      thc,
      cbd,
      badge: badge || undefined,
      rating,
      reviewCount,
      offers,
      effects: parseCsv(effectsText),
      flavors: parseCsv(flavorsText),
      category: parseCsv(categoryText),
      environment,
      difficulty,
      floweringSpeed,
      description,
      hue,
      heritage: heritage.trim() || undefined,
      image: image.trim() || undefined,
      images: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    const res = await fetch(`/api/admin/strains/${strain.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/admin/strains");
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
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
        </div>
        <div>
          <label className={label}>Slug (fixed)</label>
          <input value={strain.slug} disabled className={`${input} bg-neutral-50 text-neutral-400`} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        <div>
          <label className={label}>THC %</label>
          <input
            type="number"
            step={0.1}
            min={0}
            max={40}
            value={thc}
            onChange={(e) => setThc(parseFloat(e.target.value) || 0)}
            className={input}
          />
        </div>
        <div>
          <label className={label}>CBD %</label>
          <input
            type="number"
            step={0.1}
            min={0}
            max={40}
            value={cbd}
            onChange={(e) => setCbd(parseFloat(e.target.value) || 0)}
            className={input}
          />
        </div>
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
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={label}>Badge</label>
          <select value={badge} onChange={(e) => setBadge(e.target.value as Badge | "")} className={input}>
            <option value="">None</option>
            {BADGES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Strain["difficulty"])}
            className={input}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Flowering speed</label>
          <select
            value={floweringSpeed}
            onChange={(e) => setFloweringSpeed(e.target.value as Strain["floweringSpeed"])}
            className={input}
          >
            {FLOWERING_SPEEDS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Environment</label>
        <div className="mt-1.5 flex gap-6">
          {(["Indoor", "Outdoor"] as const).map((v) => (
            <label key={v} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={environment.includes(v)}
                onChange={() => toggleEnvironment(v)}
                className="h-4 w-4 accent-emerald-600"
              />
              {v}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Seed bank offers
          </p>
          <button
            type="button"
            onClick={addOffer}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
          >
            <Plus size={13} /> Add offer
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {offers.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={o.seedBankId}
                onChange={(e) => updateOffer(i, { seedBankId: e.target.value })}
                className={`${input} mt-0 flex-1`}
              >
                {seedBanks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                step={0.01}
                value={o.price}
                onChange={(e) => updateOffer(i, { price: parseFloat(e.target.value) || 0 })}
                placeholder="Price"
                className={`${input} mt-0 w-24`}
              />
              <select
                value={o.type}
                onChange={(e) => updateOffer(i, { type: e.target.value as StrainType })}
                className={`${input} mt-0 w-36`}
              >
                {STRAIN_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeOffer(i)}
                title="Remove offer"
                className="shrink-0 text-neutral-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {offers.length === 0 && (
            <p className="text-xs text-neutral-400">No offers yet — add at least one.</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className={label}>Effects (comma separated)</label>
          <input value={effectsText} onChange={(e) => setEffectsText(e.target.value)} className={input} />
        </div>
        <div>
          <label className={label}>Flavors (comma separated)</label>
          <input value={flavorsText} onChange={(e) => setFlavorsText(e.target.value)} className={input} />
        </div>
        <div>
          <label className={label}>Category tags (comma separated)</label>
          <input value={categoryText} onChange={(e) => setCategoryText(e.target.value)} className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={input}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>Heritage / lineage (optional)</label>
          <input
            value={heritage}
            onChange={(e) => setHeritage(e.target.value)}
            placeholder="e.g. mostly indica"
            className={input}
          />
        </div>
        <div>
          <label className={label}>Cover hue ({hue})</label>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={359}
              value={hue}
              onChange={(e) => setHue(parseInt(e.target.value, 10))}
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
        <label className={label}>Featured image</label>
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
              Leave blank to use the generated cover art (cover hue above). A file dropped into
              /public/strains named {strain.slug}.jpg|png|webp overrides this automatically.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className={label}>Gallery images (one URL per line, optional)</label>
        <textarea
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          rows={3}
          placeholder={"https://…/angle-2.webp\nhttps://…/angle-3.webp"}
          className={`${input} font-mono text-[13px]`}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/strains")}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
