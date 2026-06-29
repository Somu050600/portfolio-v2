import type { AccentKey } from "./theme.config";

export type ThumbnailKind =
  | "image"
  | "generative"
  | "ascii"
  | "spotlight"
  | "glitch"
  | "parallax"
  | "flip"
  | "video"
  | "replay"
  | "vt-cycle";

export interface Thumbnail {
  kind: ThumbnailKind;
  alt: string;
  /** Static frame: first paint + universal fallback */
  poster?: string;
  accent?: AccentKey;
  /** Per-treatment options (typed per kind as built) */
  params?: Record<string, unknown>;
}

export interface FlipThumbParams {
  front: {
    label?: string;
    sublabel?: string;
    swatches: string[];
    type?: { display: string; sample: string; scaleLabel?: string };
    button?: { label: string };
    badge?: string;
    showToggle?: boolean;
    input?: string;
    showRadii?: boolean;
  };
  back: {
    heading?: string;
    rows: { k: string; v: string; accent?: boolean }[];
  };
  /** Force compact layout (hides secondary row + badge/toggle). */
  compact?: boolean;
}

/** CSS-only treatments — mount in-view without consuming animation slots. */
export const CHEAP_KINDS = new Set<ThumbnailKind>([
  "flip",
  "parallax",
  "glitch",
  "ascii",
  "replay",
  "vt-cycle",
]);
