import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

// Saves uploaded images into /public/uploads so they can be referenced by
// URL from post content. This writes to the filesystem, so it only works
// where the app runs with a writable disk (local dev, or a persistent
// server) — on Vercel's serverless runtime the filesystem is read-only in
// production, so this will fail there. Upload locally and commit the file
// (or deploy) so it ships as a static asset, or paste an external URL
// instead.

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type — use JPG, PNG, WebP, GIF or AVIF" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (8MB max)" }, { status: 400 });
  }

  const filename = `${crypto.randomUUID()}.${ext}`;
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
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
