import { describe, expect, mock, test } from "bun:test";
import { metadata as workMetadata } from "./home/page";
import { metadata as aboutMetadata } from "./home/about/page";
import { metadata as experienceMetadata } from "./home/experience/page";
import { metadata as photographyMetadata } from "./home/photography/page";
import { metadata as playgroundMetadata } from "./home/playground/page";
import { generateMetadata as getExperimentMetadata } from "./home/playground/[slug]/page";
import { generateMetadata as getCaseStudyMetadata } from "./home/work/[slug]/page";
import sitemap from "./sitemap";

const font = () => ({ variable: "font-variable", className: "font-class" });

mock.module("next/font/google", () => ({
  DotGothic16: font,
  Geist: font,
  Glass_Antiqua: font,
  Source_Code_Pro: font,
}));

const expectedStaticPages = [
  [workMetadata, "Work", "/home"],
  [aboutMetadata, "About", "/home/about"],
  [experienceMetadata, "Experience", "/home/experience"],
  [photographyMetadata, "Photography", "/home/photography"],
  [playgroundMetadata, "Playground", "/home/playground"],
] as const;

describe("SEO metadata", () => {
  test("uses the full identity for the global title system without a root canonical", async () => {
    const { metadata: rootMetadata } = await import("./layout");

    expect(rootMetadata.title).toEqual({
      default: "Eega Somasekhara Reddy (Somu) — Frontend Engineer",
      template: "%s · Eega Somasekhara Reddy",
    });
    expect(rootMetadata.applicationName).toBe("Eega Somasekhara Reddy (Somu)");
    expect(rootMetadata.alternates).toBeUndefined();
  });

  test.each(expectedStaticPages)(
    "%s page publishes a self-canonical and complete share metadata",
    (metadata, title, path) => {
      expect(metadata).toMatchObject({
        title,
        alternates: { canonical: path },
        openGraph: {
          type: "website",
          url: path,
          siteName: "Eega Somasekhara Reddy",
          title: `${title} · Eega Somasekhara Reddy`,
          locale: "en_US",
        },
        twitter: {
          card: "summary_large_image",
          title: `${title} · Eega Somasekhara Reddy`,
        },
      });
      expect(metadata.description).toContain("Eega Somasekhara Reddy");
    },
  );

  test("publishes self-canonical metadata for a live playground experiment", async () => {
    const metadata = await getExperimentMetadata({
      params: Promise.resolve({ slug: "type-lab" }),
    });

    expect(metadata).toMatchObject({
      title: "Type Lab — Playground",
      alternates: { canonical: "/home/playground/type-lab" },
      openGraph: {
        type: "website",
        url: "/home/playground/type-lab",
        title: "Type Lab — Playground · Eega Somasekhara Reddy",
      },
      twitter: {
        card: "summary_large_image",
        title: "Type Lab — Playground · Eega Somasekhara Reddy",
      },
    });
  });

  test("keeps project-specific metadata and canonical URLs for case studies", async () => {
    const metadata = await getCaseStudyMetadata({
      params: Promise.resolve({ slug: "design-system" }),
    });

    expect(metadata).toMatchObject({
      title: "AI-Optimized Design System",
      alternates: { canonical: "/home/work/design-system" },
      openGraph: {
        type: "article",
        url: "/home/work/design-system",
        title: "AI-Optimized Design System · Eega Somasekhara Reddy",
        authors: ["https://eega.dev/home/about"],
      },
      twitter: {
        card: "summary_large_image",
        title: "AI-Optimized Design System · Eega Somasekhara Reddy",
      },
    });
  });
});

test("sitemap exposes public routes without fabricated modification dates", () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  expect(urls).toContain("https://eega.dev/");
  expect(urls).toContain("https://eega.dev/home");
  expect(urls).toContain("https://eega.dev/home/about");
  expect(urls).toContain("https://eega.dev/home/experience");
  expect(urls).toContain("https://eega.dev/home/photography");
  expect(urls).toContain("https://eega.dev/home/playground");
  expect(urls).toContain("https://eega.dev/home/playground/type-lab");
  expect(urls).toContain("https://eega.dev/home/work/design-system");
  expect(entries.every((entry) => entry.lastModified === undefined)).toBe(true);
});
