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
| `SITE_URL` | Canonical site URL used in sitemaps, robots.txt and JSON-LD. Defaults to `https://growingweed.com`. |
| `INDEXNOW_KEY` | [IndexNow](https://www.bing.com/indexnow/getstarted) key used to notify Bing/Yandex of new or changed posts. Optional — defaults to the key already committed at `public/8f08d7690518436b9e29c85c9a84cff2.txt`. If you rotate it, rename that file to match. |
| `SUPABASE_URL` | Your Supabase project's API URL (Project Settings -> API). Required — this is where posts, the content plan, and uploaded images all live. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for that project (Project Settings -> API). Required. Full-access, server-only — never expose this to the client. |

## Admin Dashboard

`/admin` manages blog posts and the editorial content plan (including CSV bulk import with scheduled batch publishing). Protected by `ADMIN_PASSWORD`.

Featured images uploaded through the post editor are converted to WebP, compressed, and stored in a public Supabase Storage bucket called `media`.

## Storage

Posts (`content/articles/*.json`), the content plan (`content/article-plan.json`, `content/content-batches.json`), and uploaded images all live in Supabase Storage, not the local filesystem — this is what makes admin writes work the same in local dev and in production (Vercel's serverless functions have a read-only filesystem at runtime, which ruled out plain `fs` writes). The `content/` directory in this repo is a point-in-time snapshot from before this migration; it's no longer read at runtime.

To set up a fresh environment: create a Supabase project, create a public Storage bucket named `media`, and set `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` from Project Settings -> API.

## Deploy

Deployed on [Vercel](https://vercel.com).
