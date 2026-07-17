"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { BlogPost } from "@/lib/types";

type PlanItem = { id: string; title: string; chapter: string; status: string };

export default function AdminDashboard() {
  const [editable, setEditable] = useState<BlogPost[] | null>(null);
  const [builtIn, setBuiltIn] = useState<BlogPost[]>([]);
  const [plan, setPlan] = useState<PlanItem[]>([]);

  const load = () => {
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((data) => {
        setEditable(data.editable ?? []);
        setBuiltIn(data.builtIn ?? []);
      });
    fetch("/api/admin/plan")
      .then((r) => r.json())
      .then(setPlan)
      .catch(() => setPlan([]));
  };

  useEffect(load, []);

  const remove = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/posts/${slug}`, { method: "DELETE" });
    load();
  };

  const planned = plan.filter((p) => p.status === "planned");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Blog Posts</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {editable ? `${editable.length + builtIn.length} published` : "Loading…"}
            {planned.length > 0 && ` · ${planned.length} planned`}
          </p>
        </div>
        <Link
          href="/admin/new"
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={15} /> New Post
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-[11px] uppercase tracking-[0.12em] text-neutral-400">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Title</th>
              <th className="hidden px-3 py-2.5 font-semibold sm:table-cell">Category</th>
              <th className="hidden px-3 py-2.5 font-semibold md:table-cell">Date</th>
              <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {editable === null && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                  Loading…
                </td>
              </tr>
            )}
            {editable?.map((p) => (
              <tr key={p.slug} className="hover:bg-neutral-50/60">
                <td className="px-3 py-2.5 font-medium text-neutral-900">{p.title}</td>
                <td className="hidden px-3 py-2.5 text-neutral-500 sm:table-cell">{p.category}</td>
                <td className="hidden px-3 py-2.5 tabular-nums text-neutral-500 md:table-cell">
                  {p.date}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-3 text-neutral-400">
                    <Link
                      href={`/${p.slug}`}
                      target="_blank"
                      title="View"
                      className="hover:text-neutral-900"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <Link href={`/admin/edit/${p.slug}`} title="Edit" className="hover:text-emerald-700">
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => remove(p.slug, p.title)}
                      title="Delete"
                      className="hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {builtIn.map((p) => (
              <tr key={p.slug} className="bg-neutral-50/40">
                <td className="px-3 py-2.5 text-neutral-500">
                  {p.title}
                  <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                    built-in
                  </span>
                </td>
                <td className="hidden px-3 py-2.5 text-neutral-400 sm:table-cell">{p.category}</td>
                <td className="hidden px-3 py-2.5 tabular-nums text-neutral-400 md:table-cell">
                  {p.date}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-3 text-neutral-300">
                    <Link
                      href={`/${p.slug}`}
                      target="_blank"
                      title="View"
                      className="hover:text-neutral-900"
                    >
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {planned.length > 0 && (
        <div className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
              Up next from the content plan
            </h2>
            <Link href="/admin/plan" className="text-xs font-medium text-emerald-700 hover:underline">
              Manage plan →
            </Link>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {planned.slice(0, 6).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-neutral-200 px-4 py-2.5 text-sm text-neutral-600"
              >
                <span className="min-w-0 truncate">
                  {p.title}
                  <span className="ml-2 text-[11px] text-neutral-300">{p.chapter}</span>
                </span>
                <Link
                  href={`/admin/new?plan=${p.id}`}
                  className="shrink-0 text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Write
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
