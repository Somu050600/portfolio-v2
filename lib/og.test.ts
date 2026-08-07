import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (relativePath: string) =>
  readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");

test("uses every approved design-system role in generated images", () => {
  const og = read("./og.ts");
  const rootCard = read("../app/opengraph-image.tsx");
  const caseStudyCard = read("../app/home/work/[slug]/opengraph-image.tsx");
  const appleIcon = read("../app/apple-icon.tsx");

  expect(og).toContain("RobotoCondensed-Regular.ttf");
  expect(og).toContain("RobotoCondensed-Medium.ttf");
  expect(og).toContain("RobotoCondensed-SemiBold.ttf");
  expect(og).toContain("RobotoCondensed-Bold.ttf");
  expect(og).toContain("Poppins-Regular.ttf");
  expect(og).toContain("Poppins-Medium.ttf");
  expect(og).toContain("Poppins-SemiBold.ttf");
  expect(og).toContain("JetBrainsMono-Regular.ttf");
  expect(og).toContain("JetBrainsMono-Medium.ttf");
  expect(og).toContain("JetBrainsMono-SemiBold.ttf");
  expect(rootCard).toContain('fontFamily: "Roboto Condensed"');
  expect(rootCard).toContain('fontFamily: "Poppins"');
  expect(caseStudyCard).toContain('fontFamily: "Roboto Condensed"');
  expect(caseStudyCard).toContain('fontFamily: "Poppins"');
  expect(appleIcon).toContain('fontFamily: "Roboto Condensed"');
  expect(`${og}${rootCard}${caseStudyCard}${appleIcon}`).not.toContain(
    "Glass Antiqua",
  );
  expect(`${og}${rootCard}${caseStudyCard}`).not.toContain("Source Code Pro");
});

test("renders the generated Apple icon with the vendored fonts", async () => {
  const { default: AppleIcon } = await import("../app/apple-icon");
  const image = AppleIcon();

  expect(image.status).toBe(200);
  expect((await image.arrayBuffer()).byteLength).toBeGreaterThan(0);
});
