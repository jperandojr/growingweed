"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Repeat, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useStore } from "@/context/StoreContext";

// Minimalist single-tier header: wordmark, plain-text nav, quiet icons,
// hamburger drawer for mobile.
const nav = [
  { label: "Strains", href: "/strains" },
  { label: "Seed Banks", href: "/seed-banks" },
  { label: "Grow Guides", href: "/grow-guides" },
  { label: "Deals", href: "/deals" },
  { label: "Community", href: "/community" },
];

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
      {count}
    </span>
  );
}

export function Header() {
  const { compare } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    router.push(`/strains${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-6">
        <Link href="/" className="shrink-0 pt-1">
          <Logo className="text-2xl" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-neutral-500 md:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition hover:text-neutral-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-neutral-500">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={searchOpen ? "Close search" : "Search strains"}
            className="transition hover:text-neutral-900"
          >
            {searchOpen ? <X size={19} /> : <Search size={19} />}
          </button>
          <Link
            href="/compare"
            aria-label="Compare strains"
            className="relative transition hover:text-neutral-900"
          >
            <Repeat size={19} />
            <CountBadge count={compare.length} />
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="transition hover:text-neutral-900 md:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-neutral-100">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-3">
            <Search size={16} className="shrink-0 text-neutral-300" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              placeholder="Search 30,000+ strains…"
              className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-neutral-100 px-6 py-3 text-sm text-neutral-600 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-2.5 hover:bg-neutral-50 hover:text-neutral-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
