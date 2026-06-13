import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { SketchProps } from "./use-sketch-loop";

export type SketchName = "fluid-dye" | "fluid-sim";

export function isSketchName(name: string): name is SketchName {
  return name === "fluid-dye" || name === "fluid-sim";
}

export const SketchComponents: Record<
  SketchName,
  ComponentType<SketchProps>
> = {
  "fluid-dye": dynamic(() => import("./fluid-dye-card"), { ssr: false }),
  "fluid-sim": dynamic(() => import("./fluid-sim-full"), { ssr: false }),
};
