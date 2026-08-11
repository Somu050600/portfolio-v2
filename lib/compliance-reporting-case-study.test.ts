import { expect, test } from "bun:test";
import { getIndexProjects, getProjectBySlug } from "./projects.config";

test("keeps compliance reporting as project two", () => {
  const compliance = getProjectBySlug("compliance-reporting");
  const liquid = getProjectBySlug("liquid-distortion");

  expect(compliance?.number).toBe(2);
  expect(liquid?.number).toBe(4);

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
