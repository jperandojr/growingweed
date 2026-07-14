import Link from "next/link";
import { Logo } from "@/components/Logo";

type IconProps = { size?: number; className?: string };

function YoutubeIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5V8.5l6.3 3.5-6.3 3.5Z" />
    </svg>
  );
}

function TwitterIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-6.6L5.8 22H2.6l7.5-8.6L2 2h6.6l4.6 6.1L18.9 2Zm-1.1 18h1.8L7.3 4h-2l12.5 16Z" />
    </svg>
  );
}

function FacebookIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H16.7V3.7A21 21 0 0 0 14.4 3.6c-2.3 0-3.9 1.4-3.9 4v2.3H8v3.1h2.5V21h3Z" />
    </svg>
  );
}

function InstagramIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const explore = [
  { label: "Strains", href: "/strains" },
  { label: "Seed Banks", href: "/seed-banks" },
  { label: "Grow Guides", href: "/grow-guides" },
  { label: "Deals", href: "/deals" },
  { label: "Community", href: "/community" },
];

const company = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/about" },
  { label: "Help Center", href: "/help" },
  { label: "Sitemap", href: "/sitemap" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1.6fr]">
          <div>
            <Link href="/" className="inline-block pt-1">
              <Logo className="text-2xl" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500">
              The grower&apos;s guide to cannabis — cultivation know-how for every
              stage of the grow, plus honest comparisons of the world&apos;s best
              seed banks.
            </p>
            <div className="mt-5 flex gap-4 text-neutral-400">
              <FacebookIcon size={16} className="transition hover:text-neutral-900" />
              <InstagramIcon size={16} className="transition hover:text-neutral-900" />
              <YoutubeIcon size={16} className="transition hover:text-neutral-900" />
              <TwitterIcon size={16} className="transition hover:text-neutral-900" />
            </div>
          </div>

          <FooterCol title="Explore" items={explore} />
          <FooterCol title="Company" items={company} />

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Newsletter
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              Growing tips and new guides, straight to your inbox.
            </p>
            <form className="mt-5 flex items-center gap-3 border-b border-neutral-300 pb-2 focus-within:border-neutral-900">
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />
              <button
                type="submit"
                className="shrink-0 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 border-t border-neutral-100 pt-8">
          <p className="text-xs leading-relaxed text-neutral-400">
            Affiliate Disclosure: GrowingWeed is an independent comparison site. When you
            buy through links on our site, we may earn a commission from our partner seed
            banks at no extra cost to you. All purchases are completed on the seed
            bank&apos;s own website.
          </p>
          <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-neutral-400 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} GrowingWeed. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="transition hover:text-neutral-900">
                Privacy
              </Link>
              <Link href="/terms" className="transition hover:text-neutral-900">
                Terms
              </Link>
              <span className="rounded-full border border-neutral-200 px-2.5 py-1">18+</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-sm text-neutral-500 transition hover:text-neutral-900"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
