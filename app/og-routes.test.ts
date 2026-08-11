import { expect, test } from "bun:test";
import type { ImageResponse } from "next/og";
import { getOgInputForPath, type OgInput } from "@/lib/og";
import sitemap from "./sitemap";

type StaticOgModule = {
  default: () => ImageResponse;
  generateImageMetadata: () => unknown;
};

type DynamicOgModule = {
  default: (props: {
    params: Promise<{ slug: string }>;
  }) => Promise<ImageResponse>;
  generateImageMetadata: (props: {
    params: { slug: string };
  }) => unknown;
};

const staticRoutes = [
  ["/", () => import("./opengraph-image")],
  ["/home", () => import("./home/opengraph-image")],
  ["/home/experience", () => import("./home/experience/opengraph-image")],
  ["/home/about", () => import("./home/about/opengraph-image")],
  ["/home/photography", () => import("./home/photography/opengraph-image")],
  ["/home/playground", () => import("./home/playground/opengraph-image")],
] as const;

test("resolves a factual OG input for every route published in the sitemap", () => {
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  const inputs = paths.map((path) => getOgInputForPath(path));

  expect(inputs.every(Boolean)).toBe(true);
  expect(new Set(inputs.map((input) => input?.title)).size).toBe(paths.length);
  expect(inputs.every((input) => input?.template !== undefined)).toBe(true);
});

test("static routes publish title-derived image metadata", async () => {
  for (const [path, load] of staticRoutes) {
    const routeModule = (await load().catch(() => undefined)) as
      | StaticOgModule
      | undefined;
    expect(routeModule, path).toBeDefined();
    if (!routeModule) continue;

    const input = getOgInputForPath(path) as OgInput;
    expect(routeModule.generateImageMetadata, path).toBeFunction();
    if (!routeModule.generateImageMetadata) continue;

    expect(routeModule.generateImageMetadata()).toEqual([
      {
        id: "default",
        alt: `${input.title} · eega.dev`,
        size: { width: 1200, height: 630 },
        contentType: "image/png",
      },
    ]);
  }
});

test("dynamic route metadata preserves each full title and stable index", async () => {
  const workModule = (await import("./home/work/[slug]/opengraph-image")) as
    unknown as DynamicOgModule;
  const playgroundModule = (await import(
    "./home/playground/[slug]/opengraph-image"
  ).catch(() => undefined)) as DynamicOgModule | undefined;

  expect(workModule.generateImageMetadata).toBeFunction();
  expect(playgroundModule).toBeDefined();
  if (!workModule.generateImageMetadata || !playgroundModule) return;

  expect(
    workModule.generateImageMetadata({
      params: { slug: "photography-pipeline" },
    }),
  ).toEqual([
    {
      id: "default",
      alt: "Engineering a Photography Portfolio Without Sacrificing the Photographs · eega.dev",
      size: { width: 1200, height: 630 },
      contentType: "image/png",
    },
  ]);
  expect(
    playgroundModule.generateImageMetadata({ params: { slug: "fluid-sim" } }),
  ).toEqual([
    {
      id: "default",
      alt: "Fluid Sim · eega.dev",
      size: { width: 1200, height: 630 },
      contentType: "image/png",
    },
  ]);

  expect(getOgInputForPath("/home/work/photography-pipeline")?.index).toBe(
    "06",
  );
  expect(getOgInputForPath("/home/playground/fluid-sim")?.index).toBe("02");
});

test("route integrations return generated PNG responses", async () => {
  const rootModule = (await import("./opengraph-image")) as StaticOgModule;
  const aboutModule = (await import(
    "./home/about/opengraph-image"
  ).catch(() => undefined)) as StaticOgModule | undefined;
  const workModule = (await import("./home/work/[slug]/opengraph-image")) as
    unknown as DynamicOgModule;

  expect(aboutModule).toBeDefined();
  if (!aboutModule) return;

  const responses = [
    rootModule.default(),
    aboutModule.default(),
    await workModule.default({
      params: Promise.resolve({ slug: "this-site" }),
    }),
  ];

  for (const response of responses) {
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0);
  }
});
