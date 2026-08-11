import { readFileSync } from "node:fs";
import { join } from "node:path";
import { landingConfig } from "./landing.config";
import { getExperiment, getLiveExperimentSlugs } from "./playground.config";
import { profile } from "./profile.config";
import { getProjectBySlug } from "./projects.config";

/** OG card canvas — the standard 1.91:1 social ratio. */
export const OG_SIZE = { width: 1200, height: 630 };

export type OgTemplate = "hero" | "rail" | "band";

export type OgInput = {
  template: OgTemplate;
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

type OgImageMetadata = {
  id: string;
  alt: string;
  size: typeof OG_SIZE;
  contentType: "image/png";
};

/** Brand palette for the OG cards (mirrors the site tokens). */
export const OG = {
  paper: "#ece8df",
  ink: "#2a2620",
  inkDim: "#6e6553",
  inkFaint: "#9a917e",
  accent: "#b85423",
  border: "#d3ccbd",
  dark: "#0a0a0a",
  darkInk: "#ededed",
  darkDim: "#8a8175",
};

const TITLE_LIMITS: Record<OgTemplate, number> = {
  hero: 34,
  rail: 58,
  band: 52,
};

const SUBTITLE_LIMITS: Partial<Record<OgTemplate, number>> = {
  rail: 100,
  band: 90,
};

function clampAtWord(value: string, maxLength: number): string {
  const clean = value.trim();
  if (clean.length <= maxLength) return clean;

  const candidate = clean.slice(0, maxLength - 1).trimEnd();
  const lastSpace = candidate.lastIndexOf(" ");
  const wordBoundary = lastSpace > 0 ? candidate.slice(0, lastSpace) : candidate;
  return `${wordBoundary.replace(/[\s,;:.-]+$/u, "")}…`;
}

/** Clamp content before Satori lays it out; type sizes never auto-shrink. */
export function normalizeOgInput(input: OgInput): OgInput {
  const titleLimit = TITLE_LIMITS[input.template];
  const subtitleLimit = SUBTITLE_LIMITS[input.template];
  const titleOverLimit = input.title.trim().length > titleLimit;
  const subtitleOverLimit = Boolean(
    input.subtitle &&
      subtitleLimit &&
      input.subtitle.trim().length > subtitleLimit,
  );

  return {
    ...input,
    title: clampAtWord(input.title, titleLimit),
    subtitle:
      titleOverLimit || subtitleOverLimit ? undefined : input.subtitle?.trim(),
  };
}

const STATIC_OG_INPUTS: Record<string, OgInput> = {
  "/": {
    template: "hero",
    title: landingConfig.hero.headline[0],
    accent: landingConfig.hero.headline.at(-1),
    name: profile.name,
    stack: landingConfig.hero.specialties,
  },
  "/home": {
    template: "rail",
    kicker: "WORK",
    title: "Work",
    subtitle: profile.hero.guide,
    meta: ["EEGA.DEV", "REACT", "NEXT.JS", "PERFORMANCE"],
  },
  "/home/experience": {
    template: "rail",
    kicker: "EXPERIENCE",
    title: "Experience",
    subtitle:
      "Frontend engineering across data security, threat intelligence, and commerce.",
    meta: ["EEGA.DEV", "AURVA", "CLOUDSEK", "MATBOOK"],
  },
  "/home/about": {
    template: "rail",
    kicker: "ABOUT",
    title: "About",
    subtitle: profile.bio,
    meta: ["EEGA.DEV", "FRONTEND", "SYSTEMS", "PERFORMANCE"],
  },
  "/home/photography": {
    template: "rail",
    kicker: "PHOTOGRAPHY",
    title: "Photography",
    subtitle: `A responsive selection of photographs by ${profile.name}, including interactive 360-degree panoramas.`,
    meta: ["EEGA.DEV", "PHOTOGRAPHY", "PANORAMAS"],
  },
  "/home/playground": {
    template: "rail",
    kicker: "PLAYGROUND",
    title: "Playground",
    subtitle:
      "Sketches and interaction studies — heavy demos pause when off-screen.",
    meta: ["EEGA.DEV", "TYPOGRAPHY", "WEBGL2", "MOTION"],
  },
};

function caseStudyOgInput(slug: string): OgInput | undefined {
  const project = getProjectBySlug(slug);
  if (!project?.caseStudy) return undefined;

  return {
    template: "band",
    kicker: "CASE STUDY",
    title: project.title,
    subtitle: project.caseStudy.tagline,
    metaLine: [project.shipped, project.role]
      .filter(Boolean)
      .join(" · ")
      .toUpperCase(),
    index: String(project.number).padStart(2, "0"),
  };
}

function playgroundOgInput(slug: string): OgInput | undefined {
  const experiment = getExperiment(slug);
  if (!experiment || experiment.status !== "live") return undefined;

  const index = getLiveExperimentSlugs().indexOf(slug);
  return {
    template: "band",
    kicker: "PLAYGROUND",
    title: experiment.title,
    subtitle: experiment.description,
    metaLine: experiment.tags.slice(0, 2).join(" · ").toUpperCase(),
    index: String(index + 1).padStart(2, "0"),
  };
}

/** Resolve canonical route data into one deterministic OG card input. */
export function getOgInputForPath(path: string): OgInput | undefined {
  const staticInput = STATIC_OG_INPUTS[path];
  if (staticInput) return staticInput;

  const caseStudyMatch = path.match(/^\/home\/work\/([^/]+)$/u);
  if (caseStudyMatch) {
    const input = caseStudyOgInput(caseStudyMatch[1]);
    return input;
  }

  const playgroundMatch = path.match(/^\/home\/playground\/([^/]+)$/u);
  if (playgroundMatch) {
    const input = playgroundOgInput(playgroundMatch[1]);
    return input;
  }

  return undefined;
}

export function getOgImageMetadata(input: OgInput): OgImageMetadata[] {
  return [
    {
      id: "default",
      alt: `${input.title.trim()} — eega.dev`,
      size: OG_SIZE,
      contentType: "image/png",
    },
  ];
}

const dir = join(process.cwd(), "assets/fonts");
const ogAssetDir = join(process.cwd(), "public/og");

/** Design-system fonts for satori/ImageResponse, read from vendored TTFs. */
export function ogFonts() {
  return [
    {
      name: "Roboto Condensed",
      data: readFileSync(join(dir, "RobotoCondensed-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Roboto Condensed",
      data: readFileSync(join(dir, "RobotoCondensed-Medium.ttf")),
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "Roboto Condensed",
      data: readFileSync(join(dir, "RobotoCondensed-SemiBold.ttf")),
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "Roboto Condensed",
      data: readFileSync(join(dir, "RobotoCondensed-Bold.ttf")),
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Poppins",
      data: readFileSync(join(dir, "Poppins-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Poppins",
      data: readFileSync(join(dir, "Poppins-Medium.ttf")),
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "Poppins",
      data: readFileSync(join(dir, "Poppins-SemiBold.ttf")),
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: readFileSync(join(dir, "JetBrainsMono-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: readFileSync(join(dir, "JetBrainsMono-Medium.ttf")),
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: readFileSync(join(dir, "JetBrainsMono-SemiBold.ttf")),
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}

/** Existing portfolio face/weight pairs reused by the OG templates. */
export function ogCardFonts() {
  return [
    {
      name: "Poppins",
      data: readFileSync(join(dir, "Poppins-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Poppins",
      data: readFileSync(join(dir, "Poppins-SemiBold.ttf")),
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: readFileSync(join(dir, "JetBrainsMono-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: readFileSync(join(dir, "JetBrainsMono-Medium.ttf")),
      weight: 500 as const,
      style: "normal" as const,
    },
    {
      name: "DotGothic16",
      data: readFileSync(join(dir, "DotGothic16-Regular.ttf")),
      weight: 400 as const,
      style: "normal" as const,
    },
  ];
}

export type OgImageAsset = "guilloche" | "glow";

const ogImageAssetFiles: Record<OgImageAsset, string> = {
  guilloche: "guilloche-light.png",
  glow: "glow-light.png",
};

const imageDataUrls = new Map<OgImageAsset, string>();

/** Embed local raster layers so build-time ImageResponse never fetches itself. */
export function ogImageDataUrl(asset: OgImageAsset): string {
  const cached = imageDataUrls.get(asset);
  if (cached) return cached;

  const data = readFileSync(join(ogAssetDir, ogImageAssetFiles[asset]));
  const url = `data:image/png;base64,${data.toString("base64")}`;
  imageDataUrls.set(asset, url);
  return url;
}
