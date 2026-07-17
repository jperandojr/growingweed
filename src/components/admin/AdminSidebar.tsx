"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, CalendarClock, Store, Sprout, LogOut } from "lucide-react";

const nav = [
  { label: "Posts", href: "/admin", icon: FileText, exact: true },
  { label: "Content Plan", href: "/admin/plan", icon: CalendarClock, exact: false },
  { label: "Seed Banks", href: "/admin/seedbanks", icon: Store, exact: false },
  { label: "Strains", href: "/admin/strains", icon: Sprout, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="flex w-56 shrink-0 flex-col justify-between">
      <div>
        <Link href="/admin" className="block px-2 text-lg font-bold text-neutral-900">
          Growing<span className="text-emerald-600">Weed</span>
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-900"
      >
        <LogOut size={16} /> Logout
      </button>
    </aside>
  );
}
