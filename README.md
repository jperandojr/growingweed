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
| `BLOB_READ_WRITE_TOKEN` | Auto-provisioned once a [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) store is linked to the project (Dashboard -> Storage -> Create Database -> Blob). Required for image uploads in `/admin` — see below. For local dev, run `vercel env pull .env.local` after linking. |

## Admin Dashboard

`/admin` manages blog posts and the editorial content plan (including CSV bulk import with scheduled batch publishing). Protected by `ADMIN_PASSWORD`.

Featured images uploaded through the post editor are converted to WebP, compressed, and stored in Vercel Blob (not the local filesystem), so uploads work the same in local dev and in production.

## Deploy

Deployed on [Vercel](https://vercel.com). Post and content-plan *text* (`content/articles/`, `content/article-plan.json`) is still filesystem-backed — writable in local dev, read-only at runtime once deployed to Vercel's serverless environment. Images are the exception: those go through Vercel Blob (see above) and work in both environments.
