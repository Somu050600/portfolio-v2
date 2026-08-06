import { expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/navigation", () => ({
  usePathname: () => "/home/photography",
  useRouter: () => ({ prefetch: () => {} }),
}));

const { default: PhotographyPage } = await import("./page");
const { default: PhotographyGallery } = await import(
  "@/components/photography/PhotographyGallery"
);

test("renders every processed photograph as a ratio-reserved frame", () => {
  const markup = renderToStaticMarkup(<PhotographyPage />);

  expect(markup).toContain("04 — PHOTOGRAPHY");
  expect(markup).toContain("Photographs");
  expect(markup).toContain(
    "Twenty selected photographs, developed for the web without touching the originals.",
  );
  expect(markup.match(/data-photo-frame=/g)).toHaveLength(20);
  expect(markup).toContain("aspect-ratio:4518/5533");
  expect(markup).toContain("aspect-ratio:8704/4352");
  expect(markup).toContain('aria-label="Toggle safelight"');
  expect(markup).toContain("whitespace-nowrap");
  expect(markup).toContain('aria-label="Fire the shutter"');
  expect(markup).toContain('href="/home/work/photography-pipeline"');
  expect(markup).toContain("ON THE TABLE");
  expect(markup.match(/data-photo-print=/g)).toHaveLength(10);
  expect(markup).toContain("The one that nearly wasn&#x27;t");
  expect(markup).toContain("20 FRAMES SHOT");
  expect(markup).toContain("20 SHOT");
});

test("renders the responsive gallery layout with Tailwind utilities", () => {
  const markup = renderToStaticMarkup(
    <PhotographyGallery />,
  );

  expect(markup).toContain("columns-4");
  expect(markup).toContain("max-[1199px]:columns-3");
  expect(markup).toContain("max-[899px]:columns-2");
  expect(markup).not.toContain("undefined");
});

test("only promotes the selected photograph during a lightbox transition", () => {
  const markup = renderToStaticMarkup(<PhotographyGallery />);
  const globalStylesPath = fileURLToPath(
    new URL("../../globals.css", import.meta.url),
  );
  const globalStyles = readFileSync(globalStylesPath, "utf8");

  expect(markup).not.toContain("view-transition-name:photo-");
  expect(globalStyles).toContain("::view-transition-group(photo-active)");
  expect(globalStyles).toContain("z-index: 2");
});

test("uses generated grid derivatives and reserves one eager LCP request", () => {
  const markup = renderToStaticMarkup(<PhotographyPage />);

  expect(markup).toContain("%2Fphotos%2Fgenerated%2F");
  expect(markup.match(/loading="eager"/g)).toHaveLength(1);
  expect(markup.match(/loading="lazy"/g)?.length).toBeGreaterThan(20);
  expect(markup).toContain('decoding="async"');
  expect(markup).toContain("srcSet=");
  expect(markup).not.toContain("/photos/01-nets-low-tide.jpg");
});
