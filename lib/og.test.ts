import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import * as ogModule from "./og";

type OgInput = {
  template: "hero" | "rail" | "band";
  title: string;
  subtitle?: string;
  kicker?: string;
  meta?: string[];
  metaLine?: string;
  index?: string;
  accent?: string;
  name?: string;
  stack?: string;
};

type OgApi = {
  getOgImageMetadata: (input: OgInput) => Array<{
    id: string;
    alt: string;
    size: { width: number; height: number };
    contentType: string;
  }>;
  getOgInputForPath: (path: string) => OgInput | undefined;
  normalizeOgInput: (input: OgInput) => OgInput;
  ogCardFonts: () => Array<{ name: string; weight: number }>;
};

const og = ogModule as typeof ogModule & Partial<OgApi>;

function requireOgApi<K extends keyof OgApi>(key: K): OgApi[K] | undefined {
  const value = og[key];
  expect(value).toBeFunction();
  return value;
}

test("clamps long card copy at a word boundary and drops its subtitle", () => {
  const normalizeOgInput = requireOgApi("normalizeOgInput");
  if (!normalizeOgInput) return;

  expect(
    normalizeOgInput({
      template: "band",
      title:
        "Engineering a photography portfolio without sacrificing the photographs",
      subtitle: "This line must be removed before the title is allowed to overflow.",
    }),
  ).toMatchObject({
    title: "Engineering a photography portfolio without…",
    subtitle: undefined,
  });
});

test("keeps realistic copy intact when it fits its template", () => {
  const normalizeOgInput = requireOgApi("normalizeOgInput");
  if (!normalizeOgInput) return;

  expect(
    normalizeOgInput({
      template: "rail",
      title: "Work",
      subtitle: "Selected frontend engineering projects and product interfaces.",
    }),
  ).toEqual({
    template: "rail",
    title: "Work",
    subtitle: "Selected frontend engineering projects and product interfaces.",
  });
});

test("maps every published static route to a distinct light-theme card", () => {
  const getOgInputForPath = requireOgApi("getOgInputForPath");
  if (!getOgInputForPath) return;

  const paths = [
    "/",
    "/home",
    "/home/experience",
    "/home/about",
    "/home/photography",
    "/home/playground",
  ];
  const cards = paths.map((path) => getOgInputForPath(path));

  expect(cards.every(Boolean)).toBe(true);
  expect(cards.map((card) => card?.title)).toEqual([
    "Clarity in interface.",
    "Work",
    "Experience",
    "About",
    "Photography",
    "Playground",
  ]);
  expect(cards.map((card) => card?.template)).toEqual([
    "hero",
    "rail",
    "rail",
    "rail",
    "rail",
    "rail",
  ]);
});

test("derives complete image metadata and alt text from each card title", () => {
  const getOgImageMetadata = requireOgApi("getOgImageMetadata");
  if (!getOgImageMetadata) return;

  expect(
    getOgImageMetadata({ template: "rail", title: "Photography" }),
  ).toEqual([
    {
      id: "default",
      alt: "Photography — eega.dev",
      size: { width: 1200, height: 630 },
      contentType: "image/png",
    },
  ]);
});

test("keeps the full route title in alt text when visible card copy is clamped", () => {
  const getOgImageMetadata = requireOgApi("getOgImageMetadata");
  if (!getOgImageMetadata) return;

  const title =
    "Engineering a Photography Portfolio Without Sacrificing the Photographs";
  expect(
    getOgImageMetadata({ template: "band", title })[0]?.alt,
  ).toBe(`${title} — eega.dev`);
});

test("renders every OG type role with existing portfolio fonts only", () => {
  const ogCardFonts = requireOgApi("ogCardFonts");
  if (!ogCardFonts) return;

  expect(ogCardFonts().map(({ name, weight }) => `${name}:${weight}`)).toEqual([
    "Poppins:400",
    "Poppins:600",
    "JetBrains Mono:400",
    "JetBrains Mono:500",
    "DotGothic16:400",
  ]);
});

test("applies DotGothic16 to the hero accent and band index", async () => {
  const { OgCard } = await import("./og-card");
  const hero = renderToStaticMarkup(
    OgCard({
      input: {
        template: "hero",
        title: "Clarity in interface.",
        accent: "Beautifully",
      },
    }),
  );
  const band = renderToStaticMarkup(
    OgCard({
      input: {
        template: "band",
        title: "This Site",
        index: "05",
      },
    }),
  );

  expect(hero).toMatch(
    /style="[^"]*font-family:DotGothic16[^"]*"[^>]*>Beautifully</u,
  );
  expect(band).toMatch(
    /style="[^"]*font-family:DotGothic16[^"]*"[^>]*>05</u,
  );
});

test("provides one canonical landing-derived guilloche background", async () => {
  const dataUrl = ogModule.ogImageDataUrl("guilloche");
  const png = Buffer.from(dataUrl.split(",")[1] ?? "", "base64");

  expect(await sharp(png).metadata()).toMatchObject({
    format: "png",
    width: 1200,
    height: 630,
  });
});

test("renders hero, rail, and band cards as real 1200x630 PNGs", async () => {
  const cardModule = await import("./og-card").catch(() => undefined);
  expect(cardModule).toBeDefined();
  if (!cardModule) return;

  const inputs: OgInput[] = [
    {
      template: "hero",
      title: "Clarity in interface.",
      accent: "Beautifully",
      name: "Eega Somasekhara Reddy",
      stack: "React · Next.js · Design Systems · Performance",
    },
    {
      template: "rail",
      kicker: "ABOUT",
      title: "About",
      subtitle: "Building fast, tactile interfaces for the web.",
      meta: ["EEGA.DEV", "FRONTEND", "SYSTEMS"],
    },
    {
      template: "band",
      kicker: "CASE STUDY",
      title: "This Site",
      subtitle: "A portfolio built as a production interface.",
      metaLine: "2025 · DESIGN + DEV",
      index: "05",
    },
  ];

  for (const input of inputs) {
    const response = cardModule.createOgImage(input);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");

    const metadata = await sharp(await response.arrayBuffer()).metadata();
    expect(metadata).toMatchObject({
      format: "png",
      width: 1200,
      height: 630,
    });
  }
});

test("keeps the hero glow lighter than its surrounding paper field", async () => {
  const cardModule = await import("./og-card");
  const input = og.getOgInputForPath?.("/");
  expect(input).toBeDefined();
  if (!input) return;

  const response = cardModule.createOgImage(input);
  const { data, info } = await sharp(await response.arrayBuffer())
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const luminanceAt = (x: number, y: number) => {
    const offset = (y * info.width + x) * info.channels;
    return data[offset] + data[offset + 1] + data[offset + 2];
  };

  expect(luminanceAt(600, 315)).toBeGreaterThan(luminanceAt(110, 315));
});

test("renders the generated Apple icon with the vendored fonts", async () => {
  const { default: AppleIcon } = await import("../app/apple-icon");
  const image = AppleIcon();

  expect(image.status).toBe(200);
  expect((await image.arrayBuffer()).byteLength).toBeGreaterThan(0);
});
