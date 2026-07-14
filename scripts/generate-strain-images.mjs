#!/usr/bin/env node
/**
 * Fully automated strain photo generation via OpenAI's image API (gpt-image-1,
 * the model behind ChatGPT's images). Generates all 4 gallery shots per strain
 * (primary + 3 angles), saves them straight into public/strains/, skips
 * anything already generated, and retries transient failures.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-strain-images.mjs wedding-cake
 *   OPENAI_API_KEY=sk-... node scripts/generate-strain-images.mjs --top 100
 *
 * Options (env vars):
 *   IMAGE_QUALITY=low|medium|high   default: low  (~$0.011 / $0.042 / $0.167 per image)
 *   CONCURRENCY=N                   default: 3 parallel requests
 *   SHOTS=1                         only generate the primary image (no angles)
 *
 * Safe to interrupt and re-run — existing files are never regenerated.
 */

import fs from "node:fs";
import path from "node:path";
import { shots } from "./image-prompts-shared.mjs";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("Set OPENAI_API_KEY environment variable first.");
  process.exit(1);
}

const ROOT = path.join(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "strains");
fs.mkdirSync(OUT_DIR, { recursive: true });

const QUALITY = process.env.IMAGE_QUALITY || "low";
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "3", 10);
const PRIMARY_ONLY = process.env.SHOTS === "1";
const SIZE = "1024x1024";

// ---- catalog ----------------------------------------------------------------

function loadCatalog() {
  const map = new Map();
  const ts = fs.readFileSync(path.join(ROOT, "src", "data", "strains.ts"), "utf8");
  for (const m of ts.matchAll(/slug: "([^"]+)",\s*\n\s*name: "([^"]+)"/g)) map.set(m[1], m[2]);
  const json = JSON.parse(
    fs.readFileSync(path.join(ROOT, "src", "data", "strains-generated.json"), "utf8")
  );
  return { map, json };
}
const { map: catalog, json: generated } = loadCatalog();

// ---- which strains ------------------------------------------------------------

let slugs = [];
const args = process.argv.slice(2);
if (args[0] === "--top") {
  const n = parseInt(args[1] ?? "10", 10);
  const curated = [...catalog.keys()].filter((slug) => !generated.some((s) => s.slug === slug));
  const popular = [...generated]
    .sort((a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating)
    .map((s) => s.slug);
  slugs = [...curated, ...popular].slice(0, n);
} else if (args.length > 0) {
  slugs = args;
} else {
  console.error("Pass strain slugs or --top N.");
  process.exit(1);
}

// ---- job list (resumable: skip existing files) ---------------------------------

const jobs = [];
for (const slug of slugs) {
  const name = catalog.get(slug);
  if (!name) {
    console.warn(`✗ ${slug}: not in catalog, skipping`);
    continue;
  }
  const strainShots = PRIMARY_ONLY ? shots(name).slice(0, 1) : shots(name);
  for (const shot of strainShots) {
    const outPath = path.join(OUT_DIR, `${slug}${shot.suffix}.png`);
    if (!fs.existsSync(outPath)) jobs.push({ slug, name, shot, outPath });
  }
}

const perImage = { low: 0.011, medium: 0.042, high: 0.167 }[QUALITY] ?? 0.042;
console.log(
  `${jobs.length} image(s) to generate at quality "${QUALITY}" ` +
    `(~$${(jobs.length * perImage).toFixed(2)} estimated), concurrency ${CONCURRENCY}\n`
);

// ---- generation with retry -----------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateOne({ slug, name, shot, outPath }, attempt = 1) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: shot.prompt,
      size: SIZE,
      quality: QUALITY,
      n: 1,
    }),
  });

  if (res.status === 429 || res.status >= 500) {
    if (attempt <= 4) {
      const wait = attempt * 15_000;
      console.warn(`… ${slug}${shot.suffix}: ${res.status}, retry ${attempt}/4 in ${wait / 1000}s`);
      await sleep(wait);
      return generateOne({ slug, name, shot, outPath }, attempt + 1);
    }
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${slug}${shot.suffix}: API ${res.status} — ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error(`${slug}${shot.suffix}: empty response`);
  fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
}

let done = 0;
let failed = 0;
const queue = [...jobs];

async function worker() {
  while (queue.length) {
    const job = queue.shift();
    try {
      await generateOne(job);
      done++;
      console.log(`✓ [${done}/${jobs.length}] ${path.basename(job.outPath)} (${job.name} — ${job.shot.label})`);
    } catch (e) {
      failed++;
      console.error(`✗ ${String(e.message ?? e)}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`\nDone: ${done} generated, ${failed} failed.`);
console.log("Restart `npm run dev` (or rebuild) so the site picks up new images.");
