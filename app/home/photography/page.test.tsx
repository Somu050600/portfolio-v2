import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { photos } from "@/lib/photography.config";

mock.module("next/navigation", () => ({
  usePathname: () => "/home/photography",
  useRouter: () => ({ prefetch: () => {} }),
}));

const { default: PhotographyPage } = await import("./page");
const { default: PhotographyGallery } = await import(
  "@/components/photography/PhotographyGallery"
);

test("renders the approved photography gallery as ratio-reserved frames", () => {
  const markup = renderToStaticMarkup(<PhotographyPage />);

  expect(markup).toContain("04 — PHOTOGRAPHY");
  expect(markup).toContain("Photographs");
  expect(markup).toContain(
    "Thirty-eight kept out of six years. The good ones are downstairs on the table.",
  );
  expect(markup.match(/data-photo-frame=/g)).toHaveLength(16);
  expect(markup).toContain("aspect-ratio:3000/2000");
  expect(markup).toContain("aspect-ratio:1688/3000");
  expect(markup).toContain("aspect-ratio:3360/1440");
  expect(markup).toContain('aria-label="Toggle safelight"');
  expect(markup).toContain('aria-label="Fire the shutter"');
  expect(markup).toContain("ON THE TABLE");
  expect(markup.match(/data-photo-print=/g)).toHaveLength(10);
  expect(markup).toContain("The one that nearly wasn&#x27;t");
  expect(markup).toContain("38 FRAMES SHOT");
  expect(markup).toContain("38 SHOT");
});

test("renders the responsive gallery layout with Tailwind utilities", () => {
  const markup = renderToStaticMarkup(
    <PhotographyGallery availableFiles={[]} />,
  );

  expect(markup).toContain("columns-4");
  expect(markup).toContain("max-[1199px]:columns-3");
  expect(markup).toContain("max-[899px]:columns-2");
  expect(markup).not.toContain("undefined");
});

test("does not request image optimization for handoff photos that are absent", () => {
  const markup = renderToStaticMarkup(<PhotographyPage />);

  expect(markup).not.toContain("/_next/image");
  expect(markup).not.toContain("/photos/01-nets-low-tide.jpg");
});

test("serves responsive sources when a real photo file is available", () => {
  const markup = renderToStaticMarkup(
    <PhotographyGallery availableFiles={[photos[0].file]} />,
  );

  expect(markup).toContain("%2Fphotos%2F01-nets-low-tide.jpg");
  expect(markup).toContain('loading="eager"');
  expect(markup).toContain('decoding="async"');
  expect(markup).toContain("srcSet=");
});
