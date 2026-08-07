import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path: string) =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("exposes one semantic core font system from the root layout", () => {
  const layout = read("../app/layout.tsx");
  const styles = read("../app/globals.css");

  expect(layout).toContain("coreFontVariables");
  expect(styles).toContain(
    "--font-display: var(--font-roboto-condensed)",
  );
  expect(styles).toContain("--font-body: var(--font-poppins)");
  expect(styles).toContain("--font-mono: var(--font-jetbrains-mono)");
  expect(styles).not.toContain("--font-home-");
  expect(styles).not.toContain("--font-cs-");
});

test("keeps the landing and photography accent fonts route-scoped", () => {
  const landing = read("../app/page.tsx");
  const photographyLayout = read("../app/home/photography/layout.tsx");
  const caseStudyLayout = read("../app/home/work/[slug]/layout.tsx");

  expect(landing).toContain("landingAccentFont.variable");
  expect(photographyLayout).toContain("photographyAccentFont.variable");
  expect(caseStudyLayout).not.toContain('from "next/font/google"');
});

test("publishes the approved semantic type scale", () => {
  const styles = read("../app/globals.css");

  for (const token of [
    "--text-display-hero",
    "--text-page-title",
    "--text-section-title",
    "--text-card-title",
    "--text-lead",
    "--text-body",
    "--text-body-sm",
    "--text-label",
    "--text-metadata",
    "--text-code",
  ]) {
    expect(styles).toContain(token);
  }
});
