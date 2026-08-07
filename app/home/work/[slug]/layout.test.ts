import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "bun:test";

test("uses the shared semantic fonts instead of loading route-specific faces", () => {
  const layoutPath = fileURLToPath(new URL("./layout.tsx", import.meta.url));
  const pagePath = fileURLToPath(new URL("./page.tsx", import.meta.url));

  expect(existsSync(layoutPath)).toBe(true);
  if (!existsSync(layoutPath)) return;

  const layoutSource = readFileSync(layoutPath, "utf8");
  const pageSource = readFileSync(pagePath, "utf8");

  expect(layoutSource).toContain('className="font-body"');
  expect(layoutSource).not.toContain('from "next/font/google"');
  expect(layoutSource).not.toContain("--font-cs-");
  expect(pageSource).not.toContain('from "next/font/google"');
});
