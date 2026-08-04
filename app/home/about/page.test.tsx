import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/navigation", () => ({
  usePathname: () => "/home/about",
  useRouter: () => ({ prefetch: () => {} }),
}));

const { default: AboutPage } = await import("./page");

test("renders the approved Elements about-page narrative", () => {
  const markup = renderToStaticMarkup(<AboutPage />);

  expect(markup).toContain("03 — ABOUT");
  expect(markup).toContain("Eega Somasekhara Reddy");
  expect(markup).toContain("Also known as Somu");
  expect(markup).toContain("React, Next.js, TypeScript, design systems");
  expect(markup).toContain("24 ELEMENTS");
  expect(markup).toContain("Came to frontend the long way");
  expect(markup).toContain("THE CRAFT OF INTERFACES");
  expect(markup).toContain("TAP THE HIGHLIGHTED PHRASE");
  expect(markup).toContain("somasekhareega [at] gmail [dot] com");
  expect(markup).toContain("Download Resume ↓");
  expect(markup).toContain('alt="Somu seated by the sea"');
  expect(markup).toContain("somu-portrait.png");
  expect(markup).toContain("/images/about/somu-shirt-mask.png");
  expect(markup).not.toContain("Portrait · 292×392");
  expect(markup).not.toContain("<footer");
});
