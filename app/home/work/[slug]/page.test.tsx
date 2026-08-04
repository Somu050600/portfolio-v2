import { expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { profile } from "@/lib/profile.config";

mock.module("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
  usePathname: () => "/home/work/design-system",
  useRouter: () => ({ prefetch: () => {} }),
}));

const { default: CaseStudyPage } = await import("./page");

test("links each case study to its author profile", async () => {
  const page = await CaseStudyPage({
    params: Promise.resolve({ slug: "design-system" }),
  });
  const markup = renderToStaticMarkup(page);

  expect(markup).toContain("Case study by");
  expect(markup).toContain(`href="/home/about"`);
  expect(markup).toContain(profile.name);
});
