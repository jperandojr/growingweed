"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { effects, flavors, thcLevels, categories } from "@/data/taxonomy";

const types = ["Feminized", "Autoflower", "Regular"];
const sorts = [
  { value: "featured", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "thc", label: "Highest THC" },
];
const letters = ["0-9", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

// Multi-value params are comma-separated: ?category=high-thc,indoor
function useParamHelpers() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getList = (key: string) => {
    const v = searchParams.get(key);
    return v ? v.split(",") : [];
  };

  const update = (mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(searchParams.toString());
    mutate(p);
    p.delete("page"); // any filter change resets pagination
    router.push(`${pathname}${p.size ? `?${p}` : ""}`, { scroll: false });
  };

  const toggleValue = (key: string, value: string) => {
    update((p) => {
      const cur = p.get(key)?.split(",") ?? [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
    });
  };

  return { searchParams, getList, update, toggleValue };
}

export function SearchSortBar() {
  const { searchParams, update } = useParamHelpers();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushed = useRef(searchParams.get("q") ?? "");

  useEffect(() => {
    if (q === lastPushed.current) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      lastPushed.current = q;
      update((p) => {
        if (q) p.set("q", q);
        else p.delete("q");
      });
    }, 350);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const activeLetter = searchParams.get("letter");
  const setLetter = (letter: string) =>
    update((p) => {
      if (activeLetter === letter) p.delete("letter");
      else p.set("letter", letter);
    });

  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search strains..."
        className="w-full rounded-md border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-600 lg:max-w-56"
      />
      <div className="no-scrollbar flex items-center gap-0.5 overflow-x-auto lg:flex-1 lg:justify-center">
        {letters.map((l) => (
          <button
            key={l}
            onClick={() => setLetter(l)}
            aria-pressed={activeLetter === l}
            className={`shrink-0 rounded px-1.5 py-1.5 text-xs font-semibold transition ${
              activeLetter === l
                ? "bg-emerald-600 text-white"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-emerald-700"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 lg:ml-auto">
        <label className="text-xs text-neutral-500">Sort by</label>
        <select
          value={searchParams.get("sort") ?? "featured"}
          onChange={(e) =>
            update((p) => {
              if (e.target.value === "featured") p.delete("sort");
              else p.set("sort", e.target.value);
            })
          }
          className="rounded-md border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-emerald-600"
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function FilterSidebar() {
  const { getList, update, toggleValue } = useParamHelpers();
  const [open, setOpen] = useState(false);

  const selTypes = getList("type");
  const selCategories = getList("category");
  const selEffects = getList("effect");
  const selFlavors = getList("flavor");
  const selThc = getList("thc");
  const activeCount =
    selTypes.length + selCategories.length + selEffects.length + selFlavors.length + selThc.length;

  const clearAll = () =>
    update((p) => {
      ["type", "category", "effect", "flavor", "thc"].forEach((k) => p.delete(k));
    });

  return (
    <aside>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-md border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 md:hidden"
      >
        <SlidersHorizontal size={15} />
        {open ? "Hide Filters" : "Show Filters"} {activeCount > 0 && `(${activeCount})`}
      </button>

      <div className={`${open ? "block" : "hidden"} md:block`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900">Filters</h2>
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800"
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        <FilterSection title="Seed Type">
          {types.map((t) => (
            <Checkbox
              key={t}
              label={t}
              checked={selTypes.includes(t)}
              onChange={() => toggleValue("type", t)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Category">
          {categories.map((c) => (
            <Checkbox
              key={c.slug}
              label={c.name}
              checked={selCategories.includes(c.slug)}
              onChange={() => toggleValue("category", c.slug)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Effect">
          {effects.map((e) => (
            <Checkbox
              key={e}
              label={e}
              checked={selEffects.includes(e)}
              onChange={() => toggleValue("effect", e)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Flavor">
          {flavors.map((f) => (
            <Checkbox
              key={f}
              label={f}
              checked={selFlavors.includes(f)}
              onChange={() => toggleValue("flavor", f)}
            />
          ))}
        </FilterSection>

        <FilterSection title="THC Level">
          {thcLevels.map((t) => (
            <Checkbox
              key={t.slug}
              label={t.name}
              checked={selThc.includes(t.slug)}
              onChange={() => toggleValue("thc", t.slug)}
            />
          ))}
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 border-b border-neutral-100 pb-6">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-neutral-500">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-emerald-600"
      />
      {label}
    </label>
  );
}
