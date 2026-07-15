import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";

// Saves uploaded images into /public/uploads so they can be referenced by
// URL from post content. This writes to the filesystem, so it only works
// where the app runs with a writable disk (local dev, or a persistent
// server) — on Vercel's serverless runtime the filesystem is read-only in
// production, so this will fail there. Upload locally and commit the file
// (or deploy) so it ships as a static asset, or paste an external URL
// instead.
//
// Every upload is converted to WebP and compressed, regardless of the
// source format, so PNGs (or anything else) never end up shipping
// uncompressed to the site.

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_WIDTH = 2000; // downscale anything wider; never upscale
const WEBP_QUALITY = 82;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type — use JPG, PNG, WebP, GIF or AVIF" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (8MB max)" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  let webpBuffer: Buffer;
  try {
    webpBuffer = await sharp(inputBuffer, { animated: file.type === "image/gif" })
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Couldn't process that image" }, { status: 400 });
  }

  const filename = `${crypto.randomUUID()}.webp`;
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), webpBuffer);
  } catch {
    return NextResponse.json(
      {
        error:
          "Couldn't write the file — this filesystem is read-only (expected on Vercel in production). Upload from local dev, or paste an external image URL instead.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: `/uploads/${filename}` });
}
