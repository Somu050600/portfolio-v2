"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query subscription (server snapshot: false).
 * useSyncExternalStore keeps it lint-clean — no setState-in-effect.
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

/**
 * Single pointer source contract: LandingCursor broadcasts smoothed pointer
 * coords on this event each frame; hero shove + parallax subscribe to it.
 */
export const LANDING_POINTER_EVENT = "landing:pointer";

export type LandingPointerDetail = { x: number; y: number };
