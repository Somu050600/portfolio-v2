import { expect, test } from "bun:test";
import { getIndexProjects, getProjectBySlug } from "./projects.config";

test("leads the index with compliance reporting", () => {
  const compliance = getProjectBySlug("compliance-reporting");
  const designSystem = getProjectBySlug("design-system");

  // The hook above the grid teases "the one that took down Prod", so the
  // payoff is the first card rather than the second.
  expect(compliance?.number).toBe(1);
  expect(designSystem?.number).toBe(2);

  const indexNumbers = getIndexProjects().map((project) => project.number);
  expect(new Set(indexNumbers).size).toBe(indexNumbers.length);
});

test("uses verified rendering terminology and separates history from hindsight", () => {
  const compliance = getProjectBySlug("compliance-reporting");
  expect(compliance?.caseStudy).toBeDefined();
  if (!compliance?.caseStudy) return;

  const serialized = JSON.stringify(compliance);
  const sectionIds = compliance.caseStudy.sections.map((section) => section.id);

  expect(serialized).toContain("chromedp");
  expect(serialized).not.toContain("Puppeteer");
  expect(sectionIds).toContain("the-production-boundary");
  expect(sectionIds).toContain("what-i-would-change");
  expect(
    compliance.caseStudy.sections.some((section) =>
      section.blocks.some(
        (block) => block.type === "demo" && block.id === "compliance-report-views",
      ),
    ),
  ).toBe(true);
});
