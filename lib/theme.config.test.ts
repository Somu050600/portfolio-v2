import { describe, expect, test } from "bun:test";
import { runInNewContext } from "node:vm";
import { ACCENT_PREPAINT_SCRIPT, THEME_DEFAULTS } from "./theme.config";

function runPrepaint(theme?: "light" | "dark") {
  const values: Record<string, string> = {};
  const storage = new Map<string, string>();
  if (theme) storage.set("theme", theme);

  runInNewContext(ACCENT_PREPAINT_SCRIPT, {
    document: {
      documentElement: {
        style: {
          setProperty: (name: string, value: string) => {
            values[name] = value;
          },
        },
      },
    },
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
    },
    matchMedia: () => ({ matches: false }),
  });

  return values;
}

describe("theme defaults", () => {
  test("uses dark mode for a first visit before React hydrates", () => {
    expect(THEME_DEFAULTS.mode).toBe("dark");
    expect(runPrepaint()).toEqual({
      "--accent": "#7FC3B1",
      "--accent-fg": "#08251F",
      "--accent-soft": "rgba(127,195,177,0.14)",
    });
  });

  test("uses the configured light accent before React hydrates", () => {
    expect(runPrepaint("light")).toEqual({
      "--accent": "#B85423",
      "--accent-fg": "#fff",
      "--accent-soft": "rgba(184,84,35,0.14)",
    });
  });
});
