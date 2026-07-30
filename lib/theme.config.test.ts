import { describe, expect, test } from "bun:test";
import { ACCENT_PREPAINT_SCRIPT, THEME_DEFAULTS } from "./theme.config";

describe("theme defaults", () => {
  test("uses dark mode for a first visit before React hydrates", () => {
    expect(THEME_DEFAULTS.mode).toBe("dark");
    expect(ACCENT_PREPAINT_SCRIPT).toContain(
      "var tm=LS.getItem('theme')||'dark';",
    );
  });
});
