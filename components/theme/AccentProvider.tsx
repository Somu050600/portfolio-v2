"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import {
  accentVars,
  resolveMode,
  THEME_DEFAULTS,
  type AccentKey,
  type Mode,
  type ThemeDraft,
} from "@/lib/theme.config";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AccentContextValue {
  /** Last confirmed + persisted state */
  committed: ThemeDraft;
  /** The current in-flight draft (may or may not differ from committed) */
  currentDraft: ThemeDraft;
  /** Is there an unsaved change (draft ≠ committed)? */
  dirty: boolean;
  /** Apply a draft to the live app — no transition. */
  preview: (draft: ThemeDraft) => void;
  /** Revert to committed state. */
  clearPreview: () => void;
  /** Persist draft → localStorage, update committed. */
  commit: (draft: ThemeDraft) => void;
  /** Reset draft to THEME_DEFAULTS (still requires Confirm to persist). */
  reset: () => void;
}

const AccentContext = createContext<AccentContextValue>({
  committed: THEME_DEFAULTS,
  currentDraft: THEME_DEFAULTS,
  dirty: false,
  preview: () => {},
  clearPreview: () => {},
  commit: () => {},
  reset: () => {},
});

export function useAccent() {
  return useContext(AccentContext);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readStoredDraft(): ThemeDraft {
  if (typeof window === "undefined") return THEME_DEFAULTS;
  try {
    const stored = JSON.parse(
      localStorage.getItem("theme-accents") ?? "{}",
    ) as Partial<ThemeDraft>;
    const rawMode = localStorage.getItem("theme") ?? THEME_DEFAULTS.mode;
    const mode = (["light", "dark", "system"] as Mode[]).includes(
      rawMode as Mode,
    )
      ? (rawMode as Mode)
      : THEME_DEFAULTS.mode;
    return {
      mode,
      darkAccent: (stored.darkAccent as AccentKey) ?? THEME_DEFAULTS.darkAccent,
      lightAccent:
        (stored.lightAccent as AccentKey) ?? THEME_DEFAULTS.lightAccent,
    };
  } catch {
    return THEME_DEFAULTS;
  }
}

function applyAccentVars(draft: ThemeDraft, resolvedMode: "light" | "dark") {
  const key =
    resolvedMode === "dark" ? draft.darkAccent : draft.lightAccent;
  const vars = accentVars(resolvedMode, key);
  const root = document.documentElement.style;
  // Write without any CSS transition — the VT API owns the visual.
  Object.entries(vars).forEach(([k, v]) => root.setProperty(k, v));
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AccentProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Initialise from localStorage on first client render.
  // Server returns THEME_DEFAULTS; pre-paint script covers the FOUC window.
  const [committed, setCommittedState] = useState<ThemeDraft>(THEME_DEFAULTS);
  const [currentDraft, setCurrentDraft] = useState<ThemeDraft>(THEME_DEFAULTS);
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const stored = readStoredDraft();
    setCommittedState(stored);
    setCurrentDraft(stored);
  }, []);

  const dirty =
    currentDraft.mode !== committed.mode ||
    currentDraft.darkAccent !== committed.darkAccent ||
    currentDraft.lightAccent !== committed.lightAccent;

  // Re-apply accent whenever resolvedTheme changes (e.g. system preference flip).
  useEffect(() => {
    if (!resolvedTheme) return;
    applyAccentVars(currentDraft, resolvedTheme as "light" | "dark");
  }, [resolvedTheme, currentDraft]);

  const preview = useCallback(
    (draft: ThemeDraft) => {
      setCurrentDraft(draft);
      // Mode change: call setTheme directly — no slant-wipe, just instant swap.
      if (draft.mode !== (theme ?? THEME_DEFAULTS.mode)) {
        setTheme(draft.mode);
      }
      const rm = resolveMode(draft.mode);
      applyAccentVars(draft, rm);
    },
    [theme, setTheme],
  );

  const clearPreview = useCallback(() => {
    setCurrentDraft(committed);
    if (committed.mode !== (theme ?? THEME_DEFAULTS.mode)) {
      setTheme(committed.mode);
    }
    const rm = resolveMode(committed.mode);
    applyAccentVars(committed, rm);
  }, [committed, theme, setTheme]);

  const commit = useCallback(
    (draft: ThemeDraft) => {
      setCommittedState(draft);
      setCurrentDraft(draft);
      setTheme(draft.mode);
      localStorage.setItem(
        "theme-accents",
        JSON.stringify({
          darkAccent: draft.darkAccent,
          lightAccent: draft.lightAccent,
        }),
      );
      const rm = resolveMode(draft.mode);
      applyAccentVars(draft, rm);
    },
    [setTheme],
  );

  const reset = useCallback(() => {
    const d: ThemeDraft = { ...THEME_DEFAULTS };
    setCurrentDraft(d);
    if (d.mode !== (theme ?? THEME_DEFAULTS.mode)) setTheme(d.mode);
    const rm = resolveMode(d.mode);
    applyAccentVars(d, rm);
  }, [theme, setTheme]);

  return (
    <AccentContext.Provider
      value={{ committed, currentDraft, dirty, preview, clearPreview, commit, reset }}
    >
      {children}
    </AccentContext.Provider>
  );
}
