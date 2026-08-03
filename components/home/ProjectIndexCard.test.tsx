import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { projects } from "@/lib/projects.config";

mock.module("next/navigation", () => ({
  usePathname: () => "/home",
  useRouter: () => ({ prefetch: () => {} }),
}));

const { default: ProjectIndexCard } = await import("./ProjectIndexCard");

test("renders case-study cards as direct links without a touch expansion gate", () => {
  const project = projects.find((item) => item.caseStudy);
  expect(project).toBeDefined();
  if (!project) return;

  const markup = renderToStaticMarkup(<ProjectIndexCard {...project} />);

  expect(markup).toContain(`href="/home/work/${project.slug}"`);
  expect(markup).not.toContain("data-touch-expanded");
  expect(markup).not.toContain('aria-expanded="false"');
});

test("renders upcoming projects without thumbnail panels", () => {
  for (const slug of ["fluid-sim", "perf-pass"]) {
    const project = projects.find((item) => item.slug === slug);
    expect(project).toBeDefined();
    if (!project) continue;

    const markup = renderToStaticMarkup(<ProjectIndexCard {...project} />);

    expect(markup).toContain("COMING SOON");
    expect(markup).not.toContain('data-morph="thumb"');
  }
});
