"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

type StoreState = {
  wishlist: string[];
  compare: string[];
};

const STORAGE_KEY = "growingweed-store-v2";

type StoreContextValue = {
  wishlist: string[];
  compare: string[];
  toggleWishlist: (strainSlug: string) => void;
  isInWishlist: (strainSlug: string) => boolean;
  toggleCompare: (strainSlug: string) => void;
  isInCompare: (strainSlug: string) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function loadInitial(): StoreState {
  if (typeof window === "undefined") return { wishlist: [], compare: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { wishlist: [], compare: [] };
    const parsed = JSON.parse(raw);
    return {
      wishlist: parsed.wishlist ?? [],
      compare: parsed.compare ?? [],
    };
  } catch {
    return { wishlist: [], compare: [] };
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>({ wishlist: [], compare: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time sync from localStorage (external system) on mount; server and
    // first client render intentionally start empty to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadInitial());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const toggleWishlist = (strainSlug: string) => {
    setState((prev) => ({
      ...prev,
      wishlist: prev.wishlist.includes(strainSlug)
        ? prev.wishlist.filter((s) => s !== strainSlug)
        : [...prev.wishlist, strainSlug],
    }));
  };

  const toggleCompare = (strainSlug: string) => {
    setState((prev) => {
      if (prev.compare.includes(strainSlug)) {
        return { ...prev, compare: prev.compare.filter((s) => s !== strainSlug) };
      }
      if (prev.compare.length >= 4) return prev;
      return { ...prev, compare: [...prev.compare, strainSlug] };
    });
  };

  const value: StoreContextValue = useMemo(
    () => ({
      wishlist: state.wishlist,
      compare: state.compare,
      toggleWishlist,
      isInWishlist: (slug: string) => state.wishlist.includes(slug),
      toggleCompare,
      isInCompare: (slug: string) => state.compare.includes(slug),
    }),
    [state]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
