import {
  GUILLOCHE_STROKE_WIDTH,
  GUILLOCHE_VIEWBOX,
  getGuillochePaths,
} from "@/lib/guilloche";

/**
 * GuillocheBackground
 *
 * A full-bleed, engraving-style line field for the landing hero. Abstract
 * guilloché influence only — no reproduction of any real banknote or
 * protected security-print artwork.
 *
 * Renders as a server component: pure SVG, no client JS, no hydration.
 * Path geometry is generated once at module scope and cached by parameter
 * pair, so switching props at most adds one extra computation per pair.
 *
 * Payload at the default settings (measured, 113 paths):
 * raw 75.8 KB · gzip 24.8 KB · brotli 13.3 KB
 */

type GuillocheBackgroundProps = {
  /** Wave height in viewBox units. Higher = more pronounced swell. */
  amplitude?: number;
  /** Vertical gap between lines in viewBox units. Lower = denser. */
  density?: number;
  /** Stroke opacity, 0–1. The main dial for how present the pattern feels. */
  lightness?: number;
  /** Fade pattern opacity behind the headline so type stays legible. */
  centreRelief?: boolean;
  className?: string;
};

const CENTRE_RELIEF_MASK =
  "radial-gradient(ellipse 46% 40% at 50% 46%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.78) 58%, #000 100%)";

export function GuillocheBackground({
  amplitude = 40,
  density = 11,
  lightness = 0.26,
  centreRelief = true,
  className = "",
}: GuillocheBackgroundProps) {
  const paths = getGuillochePaths(amplitude, density);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${GUILLOCHE_VIEWBOX.width} ${GUILLOCHE_VIEWBOX.height}`}
      // Maps the viewBox 1:1 onto the element box. Coverage is then guaranteed
      // at every viewport shape; the cost is that stroke widths would scale
      // non-uniformly, which vector-effect="non-scaling-stroke" cancels out.
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`.trim()}
      style={
        centreRelief
          ? {
              maskImage: CENTRE_RELIEF_MASK,
              WebkitMaskImage: CENTRE_RELIEF_MASK,
            }
          : undefined
      }
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={GUILLOCHE_STROKE_WIDTH}
        opacity={lightness}
      >
        {paths.map((d, i) => (
          <path key={i} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}

export default GuillocheBackground;
