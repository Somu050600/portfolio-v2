import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import BlockRenderer from "./BlockRenderer";
import VTLab from "./VTLab";
import {
  caseStudyCodeToggle,
  caseStudyMono,
  caseStudyProse,
} from "./case-study-classes";

test("uses the shared body typography for a plain paragraph", () => {
  const plain = renderToStaticMarkup(
    <BlockRenderer blocks={[{ type: "paragraph", text: "Plain body copy." }]} />,
  );
  const emphasized = renderToStaticMarkup(
    <BlockRenderer
      blocks={[
        {
          type: "paragraph",
          text: "Body copy with emphasis.",
          emphasis: ["emphasis"],
        },
      ]}
    />,
  );

  expect(plain.match(/<p[^>]*>/)?.[0]).toBe(
    emphasized.match(/<p[^>]*>/)?.[0],
  );
});

test("marks the View Transitions lab as a responsive article artifact", () => {
  const html = renderToStaticMarkup(<VTLab />);

  expect(html).toContain("<figure data-cs-artifact");
});

test("keeps the floating code toggle legible over scrolling code", () => {
  expect(caseStudyCodeToggle).toContain("bg-thumb-bg/90");
  expect(caseStudyCodeToggle).toContain("backdrop-blur-md");
  expect(caseStudyCodeToggle).toContain("text-thumb-ink");
  expect(caseStudyCodeToggle).toContain("z-10");
});

test("uses semantic body and technical roles for case-study content", () => {
  expect(caseStudyProse).toContain("font-body");
  expect(caseStudyProse).toContain("text-body");
  expect(caseStudyMono).toContain("font-mono");
  expect(caseStudyMono).not.toContain("--font-cs-");
});

test("renders the measured photography pipeline as a native case-study artifact", () => {
  const html = renderToStaticMarkup(
    <BlockRenderer
      blocks={[
        { type: "diagram", kind: "photography-pipeline" } as never,
        { type: "diagram", kind: "photo-delivery" } as never,
      ]}
    />,
  );

  expect(html).toContain("Read-only source audit");
  expect(html).toContain("Active viewer only");
  expect(html.match(/data-cs-artifact/g)).toHaveLength(2);
});

test("renders the compliance pipeline with the verified production boundary", () => {
  const html = renderToStaticMarkup(
    <BlockRenderer
      blocks={[
        { type: "diagram", kind: "compliance-pipeline" },
        { type: "diagram", kind: "memory-blowup" },
      ]}
    />,
  );

  expect(html).toContain("Go + chromedp");
  expect(html).toContain("Async report job");
  expect(html).toContain("Exact mix unproven");
  expect(html).not.toContain("Puppeteer");
  expect(html).not.toContain("Each request = one full Chromium instance");
});
