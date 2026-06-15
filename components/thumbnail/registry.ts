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
  // generative: dynamic(() => import("./treatments/Generative"), { ssr: false }),
  // ...added one at a time
};
