export type ExperimentStatus = "live";

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
      "Per-character type interactions: spotlight, magnetic pull, decode scramble, and swell.",
    status: "live",
    tags: ["Typography", "Motion", "Interaction"],
  },
  {
    slug: "fluid-sim",
    title: "Fluid Sim",
    description:
      "Full-screen dye injection into a stable-fluid solver, driven by the pointer.",
    status: "live",
    tags: ["WebGL2", "GLSL", "Creative coding"],
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((e) => e.slug === slug);
}

export function getLiveExperimentSlugs(): string[] {
  return experiments.filter((e) => e.status === "live").map((e) => e.slug);
}
