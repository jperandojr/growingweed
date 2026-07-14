# GrowingWeed

Cannabis growing guides, strain library, and seed bank comparisons — [growingweed.com](https://growingweed.com). Built with Next.js (App Router), TypeScript and Tailwind CSS.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | Password for `/admin` (blog + content plan dashboard). Set a real value in production — there is a weak fallback for local dev only. |
| `SITE_URL` | Canonical site URL used in sitemaps, robots.txt and JSON-LD. Defaults to `https://www.growingweed.com`. |

## Admin Dashboard

`/admin` manages blog posts and the editorial content plan (including CSV bulk import with scheduled batch publishing). Protected by `ADMIN_PASSWORD`.

## Deploy

Deployed on [Vercel](https://vercel.com). Content (`content/articles/`, `content/article-plan.json`) is filesystem-backed — writable in local dev, read-only at runtime once deployed to Vercel's serverless environment.
