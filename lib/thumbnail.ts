import type { AccentKey } from "./theme.config";

export type ThumbnailKind =
  | "image"
  | "generative"
  | "ascii"
  | "spotlight"
  | "glitch"
  | "parallax"
  | "flip"
  | "video";

export interface Thumbnail {
  kind: ThumbnailKind;
  alt: string;
  /** Static frame: first paint + universal fallback */
  poster?: string;
  accent?: AccentKey;
  /** Per-treatment options (typed per kind as built) */
  params?: Record<string, unknown>;
}
