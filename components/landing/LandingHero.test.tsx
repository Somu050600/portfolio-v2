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
  expect(markup).not.toContain(`aria-label="${profile.name}`);
});
