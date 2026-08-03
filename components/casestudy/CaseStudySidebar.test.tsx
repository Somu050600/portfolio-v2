import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import CaseStudySidebar from "./CaseStudySidebar";

test("renders a mobile back control that links to the home page", () => {
  const markup = renderToStaticMarkup(
    <CaseStudySidebar
      projectTitle="Design System"
      sections={[{ id: "overview", label: "Overview" }]}
    />,
  );

  expect(markup).toContain('href="/home"');
  expect(markup).toContain('aria-label="Back to home"');
  expect(markup).toContain("data-mobile-case-study-back");
  expect(markup).toContain("lucide-arrow-left");
});
