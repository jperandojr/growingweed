// Simple cookie-token auth for the admin dashboard.
// Set ADMIN_PASSWORD in your environment; the fallback is for local dev only.
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "growingweed";
export const ADMIN_COOKIE = "gw-admin";

/** Session token = SHA-256 of the password (Web Crypto, works in edge + node). */
export async function adminToken(): Promise<string> {
  const data = new TextEncoder().encode(`gw:${ADMIN_PASSWORD}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
