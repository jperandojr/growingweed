"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ExternalLink, Pencil } from "lucide-react";

type Result = { slug: string; name: string; thc: number; badge?: string; category: string[] };

export default function AdminStrainsPage() {
  const [q, setQ] = useState("");
  const [fetched, setFetched] = useState<Result[] | null>(null);
  // Only meaningful once the query is non-empty — avoids clearing state
  // synchronously from the effect below when the box is emptied.
  const results = q.trim() ? fetched : null;

  useEffect(() => {
    const query = q.trim();
    if (!query) return;
    const handle = setTimeout(() => {
      fetch(`/api/admin/strains/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setFetched)
        .catch(() => setFetched([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [q]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Strains</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Search the catalog to edit an existing strain. Strains aren&apos;t added or removed here —
        this catalog is imported in bulk.
      </p>

      <div className="relative mt-6 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by strain name…"
          className="w-full rounded-lg border border-neutral-200 py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-emerald-600"
        />
      </div>

      {results !== null && (
        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase tracking-[0.12em] text-neutral-400">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Name</th>
                <th className="hidden px-3 py-2.5 font-semibold sm:table-cell">THC</th>
                <th className="hidden px-3 py-2.5 font-semibold md:table-cell">Badge</th>
                <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                    No strains match &quot;{q}&quot;.
                  </td>
                </tr>
              )}
              {results.map((s) => (
                <tr key={s.slug} className="hover:bg-neutral-50/60">
                  <td className="px-3 py-2.5 font-medium text-neutral-900">{s.name}</td>
                  <td className="hidden px-3 py-2.5 text-neutral-500 sm:table-cell">{s.thc}%</td>
                  <td className="hidden px-3 py-2.5 text-neutral-500 md:table-cell">{s.badge ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-3 text-neutral-400">
                      <Link
                        href={`/strains/${s.slug}`}
                        target="_blank"
                        title="View"
                        className="hover:text-neutral-900"
                      >
                        <ExternalLink size={15} />
                      </Link>
                      <Link href={`/admin/strains/edit/${s.slug}`} title="Edit" className="hover:text-emerald-700">
                        <Pencil size={15} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
