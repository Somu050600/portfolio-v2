// Single source of truth for the accent / theme system.
// Consumed by AccentProvider, ThemeCustomizer, and the pre-paint script.

export type Mode = "light" | "dark" | "system";

export type AccentKey =
  | "blue"
  | "sky"
  | "cyan"
  | "indigo"
  | "violet"
  | "emerald"
  | "terracotta"
  | "coral"
  | "amber";

export interface Accent {
  name: string;
  dark: string;
  light: string;
  fgDark: string;
  fgLight: string;
}

export const ACCENTS: Record<AccentKey, Accent> = {
  blue: {
    name: "Electric blue",
    dark: "#3B82F6",
    light: "#2563EB",
    fgDark: "#fff",
    fgLight: "#fff",
  },
  sky: {
    name: "Sky",
    dark: "#38BDF8",
    light: "#0EA5E9",
    fgDark: "#082F49",
    fgLight: "#fff",
  },
  cyan: {
    name: "Cyan",
    dark: "#22D3EE",
    light: "#0891B2",
    fgDark: "#083344",
    fgLight: "#fff",
  },
  indigo: {
    name: "Indigo",
    dark: "#6366F1",
    light: "#4F46E5",
    fgDark: "#fff",
    fgLight: "#fff",
  },
  violet: {
    name: "Violet",
    dark: "#A78BFA",
    light: "#7C3AED",
    fgDark: "#2E1065",
    fgLight: "#fff",
  },
  emerald: {
    name: "Emerald",
    dark: "#34D399",
    light: "#059669",
    fgDark: "#022C22",
    fgLight: "#fff",
  },
  terracotta: {
    name: "Terracotta",
    dark: "#E08A5F",
    light: "#B85423",
    fgDark: "#3A1506",
    fgLight: "#fff",
  },
  coral: {
    name: "Coral",
    dark: "#FB8470",
    light: "#D14A3A",
    fgDark: "#3A1009",
    fgLight: "#fff",
  },
  amber: {
    name: "Amber",
    dark: "#F2B441",
    light: "#A8741A",
    fgDark: "#3A2702",
    fgLight: "#fff",
  },
};

export type ThemeDraft = {
  mode: Mode;
  darkAccent: AccentKey;
  lightAccent: AccentKey;
};

export const THEME_DEFAULTS: ThemeDraft = {
  mode: "light",
  darkAccent: "blue",
  lightAccent: "terracotta",
};

/** Hex → rgba string at `alpha` opacity (0–1). */
function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Returns the three CSS custom property values for the given mode + accent.
 * Call this whenever you need to apply accent vars to `documentElement`.
 */
export function accentVars(
  mode: "light" | "dark",
  key: AccentKey,
): Record<string, string> {
  const a = ACCENTS[key];
  const c = mode === "dark" ? a.dark : a.light;
  const fg = mode === "dark" ? a.fgDark : a.fgLight;
  return {
    "--accent": c,
    "--accent-fg": fg,
    "--accent-soft": hexAlpha(c, 0.14),
  };
}

/** Resolves 'system' to 'light' | 'dark' using matchMedia. Browser-only. */
export function resolveMode(mode: Mode): "light" | "dark" {
  if (mode === "system") {
    return typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

/**
 * Minimal self-contained pre-paint script (runs before first paint in <head>).
 * Reads theme-accents from localStorage and applies --accent vars to <html>
 * so the correct accent is present before React hydrates.
 * Must stay in sync with ACCENTS above.
 */
export const ACCENT_PREPAINT_SCRIPT = `(function(){try{
  var LS=localStorage;
  var stored=JSON.parse(LS.getItem('theme-accents')||'{}');
  var da=stored.darkAccent||'blue';
  var la=stored.lightAccent||'terracotta';
  var tm=LS.getItem('theme')||'light';
  var dark=tm==='dark'||(tm==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);
  var A={
    blue:{d:'#3B82F6',l:'#2563EB',fd:'#fff',fl:'#fff'},
    sky:{d:'#38BDF8',l:'#0EA5E9',fd:'#082F49',fl:'#fff'},
    cyan:{d:'#22D3EE',l:'#0891B2',fd:'#083344',fl:'#fff'},
    indigo:{d:'#6366F1',l:'#4F46E5',fd:'#fff',fl:'#fff'},
    violet:{d:'#A78BFA',l:'#7C3AED',fd:'#2E1065',fl:'#fff'},
    emerald:{d:'#34D399',l:'#059669',fd:'#022C22',fl:'#fff'},
    terracotta:{d:'#E08A5F',l:'#B85423',fd:'#3A1506',fl:'#fff'},
    coral:{d:'#FB8470',l:'#D14A3A',fd:'#3A1009',fl:'#fff'},
    amber:{d:'#F2B441',l:'#A8741A',fd:'#3A2702',fl:'#fff'}
  };
  var key=dark?da:la;
  var a=A[key]||A[dark?'blue':'terracotta'];
  var c=dark?a.d:a.l;
  var fg=dark?a.fd:a.fl;
  var r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16);
  var s=document.documentElement.style;
  s.setProperty('--accent',c);
  s.setProperty('--accent-fg',fg);
  s.setProperty('--accent-soft','rgba('+r+','+g+','+b+',0.14)');
}catch(e){}})();`;
