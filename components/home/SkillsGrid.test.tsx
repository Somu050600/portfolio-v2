import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { aboutSkills } from "@/lib/about.config";
import * as skillsModule from "./SkillsGrid";

test("renders every configured skill as a filterable periodic table", () => {
  const markup = renderToStaticMarkup(<skillsModule.default />);

  expect(markup.match(/data-skill-element/g) ?? []).toHaveLength(
    aboutSkills.length,
  );
  expect(markup).toContain('aria-label="Filter skills by group"');
  expect(markup).toContain("STATE &amp; DATA");
  expect(markup).toContain("REACT QUERY");
});

test("covers what the site is built from, and drops the keyword filler", () => {
  const names: string[] = aboutSkills.map((skill) => skill.name);

  for (const name of ["STORYBOOK", "GSAP", "THREE.JS", "VIEW TRANSITIONS"]) {
    expect(names).toContain(name);
  }
  for (const name of ["POSTMAN", "CHAKRA", "ANT DESIGN", "RN PAPER", "MUI"]) {
    expect(names).not.toContain(name);
  }
});

test("dims only skills outside the active group", () => {
  const { isSkillDimmed } = skillsModule as typeof skillsModule & {
    isSkillDimmed?: (activeGroup: string, skillGroup: string) => boolean;
  };

  expect(isSkillDimmed).toBeFunction();
  if (!isSkillDimmed) return;

  expect(isSkillDimmed("all", "ui")).toBe(false);
  expect(isSkillDimmed("ui", "ui")).toBe(false);
  expect(isSkillDimmed("languages", "ui")).toBe(true);
});

test("reveals atomic numbers for either hover preview or pinned state", () => {
  const { shouldRevealAtomicNumbers } = skillsModule as typeof skillsModule & {
    shouldRevealAtomicNumbers?: (pinned: boolean, hovered: boolean) => boolean;
  };

  expect(shouldRevealAtomicNumbers).toBeFunction();
  if (!shouldRevealAtomicNumbers) return;

  expect(shouldRevealAtomicNumbers(false, false)).toBe(false);
  expect(shouldRevealAtomicNumbers(true, false)).toBe(true);
  expect(shouldRevealAtomicNumbers(false, true)).toBe(true);
});
