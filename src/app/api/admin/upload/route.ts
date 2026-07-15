import crypto from "node:crypto";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

// Uploaded images are stored in Vercel Blob (not the local filesystem —
// Vercel's serverless functions can't write to disk in production, which
// this sidesteps entirely). Every upload is converted to WebP and
// compressed via sharp before it's stored, regardless of source format.
//
// Requires a Blob store linked to the project (Vercel Dashboard -> Storage
// -> Create Database -> Blob), which provisions BLOB_READ_WRITE_TOKEN
// automatically in production. For local dev, run `vercel env pull
// .env.local` after linking the project to get that token locally.

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

  try {
    // sharp's output buffer can be backed by a SharedArrayBuffer internally
    // (its native pixel-buffer pooling), which @vercel/blob's put() rejects
    // outright. Buffer.from(buffer) copies into a fresh, plain ArrayBuffer
    // regardless of what backed the source.
    const safeBuffer = Buffer.from(webpBuffer);
    const blob = await put(`uploads/${crypto.randomUUID()}.webp`, safeBuffer, {
      access: "public",
      contentType: "image/webp",
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error: `Upload to Vercel Blob failed: ${message}. Make sure a Blob store is linked to this project (Vercel Dashboard -> Storage), and that BLOB_READ_WRITE_TOKEN is set (run "vercel env pull .env.local" for local dev after linking).`,
      },
      { status: 500 }
    );
  }
}
