"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Wrong password");
    }
  };

  return (
    <div className="mx-auto max-w-sm py-20">
      <div className="flex items-center gap-2 text-neutral-900">
        <Lock size={18} className="text-emerald-700" />
        <h1 className="text-xl font-bold">Admin Login</h1>
      </div>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-lg border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Checking…" : "Sign In"}
        </button>
      </form>
      <p className="mt-4 text-xs text-neutral-400">
        Set the <code className="rounded bg-neutral-100 px-1">ADMIN_PASSWORD</code> environment
        variable to change the password.
      </p>
    </div>
  );
}
