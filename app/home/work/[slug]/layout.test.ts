import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "bun:test";

test("loads case-study fonts from the route layout instead of the page", () => {
  const layoutPath = fileURLToPath(new URL("./layout.tsx", import.meta.url));
  const pagePath = fileURLToPath(new URL("./page.tsx", import.meta.url));

  expect(existsSync(layoutPath)).toBe(true);
  if (!existsSync(layoutPath)) return;

  const layoutSource = readFileSync(layoutPath, "utf8");
  const pageSource = readFileSync(pagePath, "utf8");

  expect(layoutSource).toContain('from "next/font/google"');
  expect(layoutSource).toContain("--font-cs-poppins");
  expect(layoutSource).toContain("--font-cs-jetbrains");
  expect(pageSource).not.toContain('from "next/font/google"');
});
