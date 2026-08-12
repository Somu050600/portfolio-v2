import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { profile } from "@/lib/profile.config";

mock.module("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
  usePathname: () => "/",
  useRouter: () => ({ prefetch: () => {} }),
}));

const { default: LandingHero } = await import("./LandingHero");

test("renders the full identity visibly once in the landing hero", () => {
  const markup = renderToStaticMarkup(<LandingHero background={null} />);
  const nameOccurrences = markup.split(profile.name).length - 1;

  expect(nameOccurrences).toBe(1);
  expect(markup).toContain(`${profile.name} · ${profile.jobTitle}`);
  expect(markup).toContain("font-accent-dot");
  expect(markup).not.toContain("font-dot");
  expect(markup).not.toContain(`aria-label="${profile.name}`);
});

test("keeps the responsive headline to three unbroken lines", () => {
  const markup = renderToStaticMarkup(<LandingHero background={null} />);
  const headlineLines = markup.match(/data-headline-line="\d"/g) ?? [];

  expect(headlineLines).toHaveLength(3);
  expect(markup).toContain("max-md:text-nowrap");
  expect(markup).toContain("max-md:text-[clamp(1rem,6vw,2.4rem)]");
  expect(markup).toMatch(
    /<em class="[^"]*font-accent-dot[^"]*font-semibold[^"]*">/,
  );
});
