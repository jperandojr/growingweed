#!/usr/bin/env node
/**
 * Export ready-to-paste image prompts for manual generation in ChatGPT,
 * Canva, or any other image tool.
 *
 * Usage:
 *   node scripts/export-image-prompts.mjs            # top 25 strains
 *   node scripts/export-image-prompts.mjs --top 100  # top 100 strains
 *
 * Writes image-prompts.md at the project root: one block per strain with the
 * exact filename to save as and the prompt to paste. Save finished images to
 * public/strains/ with that filename and the site picks them up automatically.
 */

import fs from "node:fs";
import path from "node:path";
import { shots } from "./image-prompts-shared.mjs";

const ROOT = path.join(import.meta.dirname, "..");

const args = process.argv.slice(2);
const top = args[0] === "--top" ? parseInt(args[1] ?? "25", 10) : 25;

// slug -> name across the whole catalog, curated first
const catalog = new Map();
const ts = fs.readFileSync(path.join(ROOT, "src", "data", "strains.ts"), "utf8");
for (const m of ts.matchAll(/slug: "([^"]+)",\s*\n\s*name: "([^"]+)"/g)) {
  catalog.set(m[1], m[2]);
}
const generated = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "data", "strains-generated.json"), "utf8")
);
const popular = [...generated].sort(
  (a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating
);
for (const s of popular) if (!catalog.has(s.slug)) catalog.set(s.slug, s.name);

const existing = new Set(
  fs.existsSync(path.join(ROOT, "public", "strains"))
    ? fs.readdirSync(path.join(ROOT, "public", "strains")).map((f) => f.replace(/\.\w+$/, ""))
    : []
);

const entries = [...catalog.entries()].slice(0, top);
let doneCount = 0;
let totalCount = 0;

let body = "";
for (const [slug, name] of entries) {
  body += `## ${name}\n\n`;
  for (const shot of shots(name)) {
    const file = `${slug}${shot.suffix}`;
    const done = existing.has(file);
    totalCount++;
    if (done) doneCount++;
    body += `### ${shot.label}${done ? " ✅" : ""}\n\n`;
    body += `**Save as:** \`public/strains/${file}.png\`\n\n`;
    body += `> ${shot.prompt}\n\n`;
  }
  body += `---\n\n`;
}

let out = `# Strain Image Prompts (top ${top} strains × 4 shots)\n\n`;
out += `Generate each image (square, 1024×1024 or larger), then save it to\n`;
out += `\`public/strains/\` with the exact filename shown. The primary image shows\n`;
out += `on cards and as the main product photo; the -2/-3/-4 angles appear as a\n`;
out += `thumbnail gallery under it. All are attached automatically by filename.\n\n`;
out += `Already done: ${doneCount}/${totalCount}\n\n---\n\n`;
out += body;

fs.writeFileSync(path.join(ROOT, "image-prompts.md"), out);
console.log(
  `Wrote image-prompts.md: ${entries.length} strains × 4 shots = ${totalCount} prompts (${doneCount} already done).`
);
