import { supabase, MEDIA_BUCKET } from "./supabase";

// JSON-file-shaped data stored in Supabase Storage instead of the local
// filesystem, so admin writes (posts, content plan) persist on Vercel's
// read-only-at-runtime serverless environment. Each "file" is one object at
// a fixed path, always overwritten in place (upsert: true) rather than
// versioned — the same read/replace-whole-file model the old fs code used.

export async function readJson<T>(pathname: string, fallback: T): Promise<T> {
  try {
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).download(pathname);
    if (error || !data) return fallback;
    return JSON.parse(await data.text()) as T;
  } catch {
    return fallback; // not found, or any other lookup failure
  }
}

export async function writeJson(pathname: string, data: unknown): Promise<void> {
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(pathname, JSON.stringify(data, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (error) throw new Error(error.message);
}

export async function deleteJson(pathname: string): Promise<void> {
  await supabase.storage.from(MEDIA_BUCKET).remove([pathname]);
}

function splitPath(pathname: string): { dir: string; name: string } {
  const i = pathname.lastIndexOf("/");
  return i === -1 ? { dir: "", name: pathname } : { dir: pathname.slice(0, i), name: pathname.slice(i + 1) };
}

export async function existsJson(pathname: string): Promise<boolean> {
  const { dir, name } = splitPath(pathname);
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list(dir, { search: name });
  if (error || !data) return false;
  return data.some((f) => f.name === name);
}

/** Pathnames of every file under `prefix` (e.g. "content/articles/"). Never
 *  throws — a lookup failure degrades to an empty list rather than crashing
 *  whatever's calling it. Folder placeholder entries (id: null) are
 *  excluded, matching how Supabase Storage represents "directories". */
export async function listJsonPathnames(prefix: string): Promise<string[]> {
  try {
    const dir = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list(dir, { limit: 1000 });
    if (error || !data) return [];
    return data.filter((f) => f.id !== null).map((f) => `${dir}/${f.name}`);
  } catch {
    return [];
  }
}
