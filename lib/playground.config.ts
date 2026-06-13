export type ExperimentStatus = "live" | "soon";

export interface Experiment {
  slug: string;
  title: string;
  description: string;
  status: ExperimentStatus;
  tags: string[];
}

export const experiments: Experiment[] = [
  {
    slug: "type-lab",
    title: "Type Lab",
    description:
      "Per-character type interactions — spotlight, magnetic pull, decode scramble, and swell.",
    status: "live",
    tags: ["Typography", "Motion", "Interaction"],
  },
  {
    slug: "fluid-sim",
    title: "Fluid Sim",
    description:
      "Full-screen dye injection into a stable-fluid solver — pointer-driven flow.",
    status: "live",
    tags: ["WebGL2", "GLSL", "Creative coding"],
  },
  {
    slug: "liquid-distortion",
    title: "Liquid Distortion",
    description: "Shader-based image warp with viscous easing.",
    status: "soon",
    tags: ["Three.js", "Shaders"],
  },
  {
    slug: "brush-reveal",
    title: "Brush Reveal",
    description: "SVG mask animation along a hand-drawn centerline.",
    status: "soon",
    tags: ["SVG", "GSAP"],
  },
  {
    slug: "color-wheels",
    title: "Color Wheels",
    description: "Interactive accent harmony explorer tied to theme tokens.",
    status: "soon",
    tags: ["Color", "Theming"],
  },
  {
    slug: "scroll-lab",
    title: "Scroll Lab",
    description: "Pinned sections and scrubbed timelines for motion studies.",
    status: "soon",
    tags: ["ScrollTrigger", "GSAP"],
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((e) => e.slug === slug);
}

export function getLiveExperimentSlugs(): string[] {
  return experiments.filter((e) => e.status === "live").map((e) => e.slug);
}
