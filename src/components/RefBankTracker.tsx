"use client";

import { useEffect } from "react";

/**
 * Invisible marker rendered on seed bank pages. Remembers the last seed bank
 * the visitor browsed (for this tab session) so strain pages can surface that
 * bank among the top recommendations.
 */
export function RefBankTracker({ bankId }: { bankId: string }) {
  useEffect(() => {
    try {
      window.sessionStorage.setItem("growingweed-ref-bank", bankId);
    } catch {
      // storage unavailable (private mode etc.) — recommendation just skips it
    }
  }, [bankId]);
  return null;
}
