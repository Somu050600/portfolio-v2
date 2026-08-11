import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { aboutSkills } from "@/lib/about.config";

mock.module("next/navigation", () => ({
  usePathname: () => "/home/about",
  useRouter: () => ({ prefetch: () => {} }),
}));

const { default: AboutPage } = await import("./page");

test("renders the approved Elements about-page narrative", () => {
  const markup = renderToStaticMarkup(<AboutPage />);

  expect(markup).toContain("03 · ABOUT");
  expect(markup).toContain("Eega Somasekhara Reddy");
  expect(markup).toContain("Also known as Somu");
  expect(markup).toContain("React, Next.js, TypeScript, design systems");
  expect(markup).toContain(`${aboutSkills.length} ELEMENTS`);
  expect(markup).toContain("Came to frontend the long way");
  expect(markup).toContain("Two things carried over");
  expect(markup).toContain("THE CRAFT OF INTERFACES");
  expect(markup).toContain("TAP THE HIGHLIGHTED PHRASE");
  // Plain address plus a copy affordance. The obfuscation was already
  // defeated by the raw mailto in the footer.
  expect(markup).toContain("somasekhareega@gmail.com");
  expect(markup).not.toContain("[at]");
  expect(markup).toContain("Download Resume ↓");
  expect(markup).toContain('alt="Somu seated by the sea"');
  expect(markup).toContain("somu-portrait.png");
  expect(markup).toContain("/images/about/somu-shirt-mask.png");
  expect(markup.match(/<h1[^>]*>/)?.[0]).toContain("text-page-title");
  expect(markup).toContain("text-card-title");
  expect(markup).not.toContain("Portrait · 292×392");
  expect(markup).not.toContain("<footer");
});
