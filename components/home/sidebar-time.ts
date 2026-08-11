"use client";

import { useCallback, useSyncExternalStore } from "react";

export function formatLocalTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function useLocalTime(timeZone: string) {
  const subscribe = useCallback((onChange: () => void) => {
    const timer = window.setInterval(onChange, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => formatLocalTime(new Date(), timeZone),
    // The server snapshot renders a real time, so first paint never shows a
    // dead clock. It can be a minute stale by the time the client hydrates, so
    // the <time> element suppresses that mismatch and the 30s tick corrects it.
    () => formatLocalTime(new Date(), timeZone),
  );
}
