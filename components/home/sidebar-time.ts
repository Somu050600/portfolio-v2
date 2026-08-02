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
    () => "--:--",
  );
}
