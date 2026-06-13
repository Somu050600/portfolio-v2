"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";
import { BUILD_MODE_STORAGE_KEY } from "@/lib/build-mode";

type SettingsContextValue = {
  buildMode: boolean;
  setBuildMode: (next: boolean) => void;
  toggleBuildMode: () => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readBuildMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(BUILD_MODE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [buildMode, setBuildModeState] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const id = requestAnimationFrame(() => {
      setBuildModeState(readBuildMode());
    });
    return () => cancelAnimationFrame(id);
  }, [hydrated]);

  const setBuildMode = useCallback((next: boolean) => {
    setBuildModeState(next);
    try {
      localStorage.setItem(BUILD_MODE_STORAGE_KEY, String(next));
    } catch {
      // ignore quota errors
    }
    document.documentElement.toggleAttribute("data-build-mode", next);
  }, []);

  const toggleBuildMode = useCallback(() => {
    setBuildMode(!buildMode);
  }, [buildMode, setBuildMode]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.toggleAttribute("data-build-mode", buildMode);
  }, [buildMode, hydrated]);

  const value = useMemo(
    () => ({
      buildMode: hydrated ? buildMode : false,
      setBuildMode,
      toggleBuildMode,
      commandOpen,
      setCommandOpen,
    }),
    [
      buildMode,
      commandOpen,
      hydrated,
      setBuildMode,
      toggleBuildMode,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
