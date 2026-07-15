import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key, which bypasses Row Level
// Security — safe here because every caller is already gated behind our own
// admin auth (see middleware.ts), not Supabase Auth.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const MEDIA_BUCKET = "media";
