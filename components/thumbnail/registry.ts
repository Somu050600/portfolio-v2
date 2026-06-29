import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { AccentKey } from "@/lib/theme.config";
import type { ThumbnailKind } from "@/lib/thumbnail";

export type TreatmentProps = {
  active: boolean;
  width: number;
  height: number;
  accent?: AccentKey;
  poster?: string;
  params?: Record<string, unknown>;
};

export const registry: Partial<
  Record<ThumbnailKind, ComponentType<TreatmentProps>>
> = {
  flip: dynamic(() => import("./treatments/FlipCard"), { ssr: false }),
  ascii: dynamic(() => import("./treatments/AsciiRender"), { ssr: false }),
  replay: dynamic(() => import("./treatments/ReplayDemo"), { ssr: false }),
  "vt-cycle": dynamic(() => import("./treatments/VTCycle"), { ssr: false }),
};
