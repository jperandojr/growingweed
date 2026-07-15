import crypto from "node:crypto";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { supabase, MEDIA_BUCKET } from "@/lib/supabase";

// Uploaded images are stored in Supabase Storage (not the local filesystem —
// Vercel's serverless functions can't write to disk in production, which
// this sidesteps entirely). Every upload is converted to WebP and
// compressed via sharp before it's stored, regardless of source format.
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (a public "media"
// bucket, created once via the Supabase Storage API — see project setup
// notes) to be set as environment variables.

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

  const pathname = `uploads/${crypto.randomUUID()}.webp`;
  // sharp's output buffer can be backed by a SharedArrayBuffer internally
  // (its native pixel-buffer pooling); Buffer.from(buffer) copies into a
  // fresh, plain ArrayBuffer, which sidesteps that regardless of what
  // backed the source.
  const safeBuffer = Buffer.from(webpBuffer);

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(pathname, safeBuffer, {
    contentType: "image/webp",
  });
  if (error) {
    return NextResponse.json(
      { error: `Upload to Supabase Storage failed: ${error.message}` },
      { status: 500 }
    );
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(pathname);
  return NextResponse.json({ url: data.publicUrl });
}
