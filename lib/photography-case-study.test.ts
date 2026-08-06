import { expect, test } from "bun:test";
import {
  getCaseStudySlugs,
  getProjectBySlug,
  projects,
} from "./projects.config";

test("publishes the photography pipeline through the native case-study model", () => {
  const project = getProjectBySlug("photography-pipeline");
  expect(getCaseStudySlugs()).toContain("photography-pipeline");
  expect(project).toMatchObject({
    number: 6,
    title: "Engineering a Photography Portfolio Without Sacrificing the Photographs",
    category: "creative",
    status: "SHIPPED",
    thumbnail: {
      poster:
        "/photos/generated/img-20181015-195513-01-358f1451/grid.webp",
      alt: "Low sunlight shines through a stone arch toward a garden.",
    },
  });
  const orderedProjects = [...projects].sort((a, b) => a.number - b.number);
  expect(orderedProjects.map(({ number }) => number)).toEqual(
    Array.from({ length: 14 }, (_, index) => index + 1),
  );
  expect(
    orderedProjects.filter(({ caseStudy }) => caseStudy).map(({ number }) => number),
  ).toEqual([1, 2, 3, 4, 5, 6]);
  expect(project?.caseStudy?.sections.length).toBeGreaterThanOrEqual(12);
  expect(JSON.stringify(project?.caseStudy)).toContain("172.5 MB");
  expect(JSON.stringify(project?.caseStudy)).toContain("28.9 MB");
  expect(JSON.stringify(project?.caseStudy)).toContain("1.43 ms");
  expect(JSON.stringify(project?.caseStudy)).toContain(
    "does not use JavaScript virtualization",
  );
  expect(JSON.stringify(project?.caseStudy)).toContain("201 KB of image transfer");
  expect(JSON.stringify(project?.caseStudy)).toContain("541 ms");
  expect(JSON.stringify(project?.caseStudy)).not.toContain("perfect score");
});
