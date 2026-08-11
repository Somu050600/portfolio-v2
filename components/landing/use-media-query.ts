"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query subscription (server snapshot: false).
 * useSyncExternalStore keeps it lint-clean, with no setState-in-effect.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
