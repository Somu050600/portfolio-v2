import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { demoRegistry } from "./registry";

test("registers an accessible synthetic multi-view compliance report", () => {
  const entry = demoRegistry["compliance-report-views"];

  expect(entry).toBeDefined();
  if (!entry) return;

  const markup = renderToStaticMarkup(<entry.Component />);
  expect(markup).toContain("Framework");
  expect(markup).toContain("Cloud");
  expect(markup).toContain("Owner");
  expect(markup).toContain("aria-pressed=\"true\"");
  expect(entry.how.code).toContain("TemplateType");
});
