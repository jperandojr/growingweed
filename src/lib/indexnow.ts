import { SITE_URL } from "./sitemap-config";

// IndexNow: tells Bing, Yandex and other participating search engines about
// new/changed/removed URLs immediately instead of waiting for a recrawl.
// https://www.bing.com/indexnow/getstarted#implementation
//
// The key below is a public identifier, not a secret — it exists only to
// prove domain ownership by matching /{key}.txt at the site root, and it's
// safe to commit. Override with an INDEXNOW_KEY env var if you rotate it;
// if you do, also rename public/{key}.txt to match.
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? "dd22d5351a8145e3ba8f80d256ecd1ab";

/** Pings IndexNow with one or more absolute or root-relative URLs. Best
 *  effort: failures are swallowed so a publish action never fails because
 *  a third-party ping did. Call this only for URLs that are actually live
 *  right now — don't submit a scheduled post before its publish date. */
export async function submitToIndexNow(urls: string[]): Promise<void> {
  const urlList = urls.filter(Boolean).map((u) => (u.startsWith("http") ? u : `${SITE_URL}${u}`));
  if (urlList.length === 0) return;

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
  } catch {
    // network hiccup or IndexNow outage — not worth failing the request over
  }
}
