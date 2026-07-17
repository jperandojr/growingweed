"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { SeedBank } from "@/lib/types";

export default function AdminSeedBanksPage() {
  const [banks, setBanks] = useState<SeedBank[] | null>(null);

  const load = () => {
    fetch("/api/admin/seedbanks")
      .then((r) => r.json())
      .then(setBanks)
      .catch(() => setBanks([]));
  };

  useEffect(load, []);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/seedbanks/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Seed Banks</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {banks ? `${banks.length} seed banks` : "Loading…"}
          </p>
        </div>
        <Link
          href="/admin/seedbanks/new"
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={15} /> New Seed Bank
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[11px] uppercase tracking-[0.12em] text-neutral-400">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Name</th>
              <th className="hidden px-3 py-2.5 font-semibold sm:table-cell">Rating</th>
              <th className="hidden px-3 py-2.5 font-semibold md:table-cell">Established</th>
              <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {banks === null && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                  Loading…
                </td>
              </tr>
            )}
            {banks?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                  No seed banks yet.
                </td>
              </tr>
            )}
            {banks?.map((b) => (
              <tr key={b.id} className="hover:bg-neutral-50/60">
                <td className="px-3 py-2.5 font-medium text-neutral-900">{b.name}</td>
                <td className="hidden px-3 py-2.5 text-neutral-500 sm:table-cell">{b.rating.toFixed(1)}</td>
                <td className="hidden px-3 py-2.5 tabular-nums text-neutral-500 md:table-cell">
                  {b.established}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-3 text-neutral-400">
                    <Link
                      href={`/seed-banks/${b.slug}`}
                      target="_blank"
                      title="View"
                      className="hover:text-neutral-900"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <Link href={`/admin/seedbanks/edit/${b.id}`} title="Edit" className="hover:text-emerald-700">
                      <Pencil size={15} />
                    </Link>
                    <button onClick={() => remove(b.id, b.name)} title="Delete" className="hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
