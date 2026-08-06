import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import BlockRenderer from "./BlockRenderer";
import VTLab from "./VTLab";
import { caseStudyCodeToggle } from "./case-study-classes";

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
