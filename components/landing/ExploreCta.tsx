"use client";

import {
  useEffect,
  useRef,
  type PointerEvent,
  type RefObject,
} from "react";

/* ---------------------------------------------------------------------------
   Tunables
   --------------------------------------------------------------------------- */

/** Half the field's full diameter (120px), before scale. */
const FIELD_BASE_RADIUS = 60;
/** Scale on enter, then the scale it grows to while hovered. */
const FIELD_ENTER_SCALE = 0.25;
const FIELD_HOVER_SCALE = 0.72;
/** Field growth / follow rate, and the pill's magnetic rate. ~320ms to settle. */
const FIELD_LERP = 0.17;
const MAGNET_LERP = 0.14;
/** How far the pill drifts toward the pointer, px — deliberately tiny. */
const MAGNET_MAX = 4;
/** Fraction of the pointer's offset from centre that becomes drift. */
const MAGNET_RATIO = 0.14;
const EPSILON = 0.01;

/** Field and mask share one geometry so the light text tracks the dark fill exactly. */
const FIELD_GRADIENT =
  "radial-gradient(circle var(--cta-field-r, 0px) at var(--cta-px, 50%) var(--cta-py, 50%), var(--landing-ink) 0 58%, transparent 74%)";
const MASK_GRADIENT =
  "radial-gradient(circle var(--cta-field-r, 0px) at var(--cta-px, 50%) var(--cta-py, 50%), #000 0 58%, transparent 74%)";

type ExploreCtaProps = {
  label: string;
  buttonRef: RefObject<HTMLButtonElement | null>;
  /** False on touch, coarse pointers and under prefers-reduced-motion. */
  interactive: boolean;
  onActivate: () => void;
  onActiveChange: (active: boolean) => void;
};

const Arrow = () => (
  <span
    aria-hidden="true"
    className="transition-transform duration-320 ease-(--ease-out-soft) group-hover:translate-x-1 group-focus-visible:translate-x-1"
  >
    →
  </span>
);

/**
 * Dark-outline pill. A soft dark field follows the pointer inside it, and a
 * duplicate light label masked to the same geometry makes only the covered
 * glyphs read light. The pill itself drifts a few px toward the pointer.
 *
 * All motion is written to CSS custom properties from one rAF loop; no state
 * updates on pointer movement.
 */
export default function ExploreCta({
  label,
  buttonRef,
  interactive,
  onActivate,
  onActiveChange,
}: ExploreCtaProps) {
  const raf = useRef(0);
  const state = useRef({
    hover: false,
    // pointer target and current, in px within the button
    tpx: 0,
    tpy: 0,
    cpx: 0,
    cpy: 0,
    // field scale
    ts: 0,
    cs: 0,
    // magnetic drift target and current
    tmx: 0,
    tmy: 0,
    cmx: 0,
    cmy: 0,
  });

  // Function declarations, not useCallback: the loop re-schedules itself, and
  // everything it touches lives in refs, so there is nothing to memoise.
  function frame() {
    const button = buttonRef.current;
    const s = state.current;
    if (!button) {
      raf.current = 0;
      return;
    }

    s.cpx += (s.tpx - s.cpx) * FIELD_LERP;
    s.cpy += (s.tpy - s.cpy) * FIELD_LERP;
    s.cs += (s.ts - s.cs) * FIELD_LERP;
    s.cmx += (s.tmx - s.cmx) * MAGNET_LERP;
    s.cmy += (s.tmy - s.cmy) * MAGNET_LERP;

    button.style.setProperty("--cta-px", `${s.cpx.toFixed(1)}px`);
    button.style.setProperty("--cta-py", `${s.cpy.toFixed(1)}px`);
    button.style.setProperty(
      "--cta-field-r",
      `${(FIELD_BASE_RADIUS * s.cs).toFixed(1)}px`,
    );
    button.style.setProperty("--cta-x", `${s.cmx.toFixed(2)}px`);
    button.style.setProperty("--cta-y", `${s.cmy.toFixed(2)}px`);

    const settled =
      Math.abs(s.ts - s.cs) < EPSILON &&
      Math.abs(s.tmx - s.cmx) < EPSILON &&
      Math.abs(s.tmy - s.cmy) < EPSILON &&
      Math.abs(s.tpx - s.cpx) < EPSILON &&
      Math.abs(s.tpy - s.cpy) < EPSILON;

    if (s.hover || !settled) {
      raf.current = requestAnimationFrame(frame);
      return;
    }

    raf.current = 0;
    // Rest state: field collapsed, pill home.
    button.style.removeProperty("--cta-field-r");
    button.style.removeProperty("--cta-x");
    button.style.removeProperty("--cta-y");
  }

  function start() {
    if (!raf.current) raf.current = requestAnimationFrame(frame);
  }

  function track(event: PointerEvent<HTMLButtonElement>) {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const s = state.current;
    s.tpx = event.clientX - rect.left;
    s.tpy = event.clientY - rect.top;
    // Drift toward the pointer, clamped hard so it stays a hint of movement.
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    s.tmx = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, offsetX * MAGNET_RATIO));
    s.tmy = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, offsetY * MAGNET_RATIO));
  }

  const onPointerEnter = (event: PointerEvent<HTMLButtonElement>) => {
    onActiveChange(true);
    if (!interactive || event.pointerType === "touch") return;
    const s = state.current;
    track(event);
    // Field opens from where the pointer actually entered.
    s.cpx = s.tpx;
    s.cpy = s.tpy;
    s.cs = FIELD_ENTER_SCALE;
    s.ts = FIELD_HOVER_SCALE;
    s.hover = true;
    start();
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!interactive || !state.current.hover) return;
    track(event);
    start();
  };

  const onPointerLeave = () => {
    onActiveChange(false);
    const s = state.current;
    s.hover = false;
    s.ts = 0;
    s.tmx = 0;
    s.tmy = 0;
    start();
  };

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    [],
  );

  return (
    <button
      ref={buttonRef}
      type="button"
      data-landing-cta
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={() => onActiveChange(true)}
      onBlur={() => onActiveChange(false)}
      onClick={onActivate}
      className={`landing-cta group relative isolate mt-6 inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-(--landing-ink) px-6 py-3 text-[11px] tracking-[0.2em] text-(--landing-ink) uppercase transition-colors duration-220 ease-(--ease-out-soft) focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-(--landing-ink) ${
        // Without the pointer field, hover is a plain fill so the CTA still
        // responds on touch and under reduced motion.
        interactive
          ? ""
          : "hover:bg-(--landing-ink) hover:text-[rgb(var(--landing-light-rgb))]"
      }`}
    >
      {interactive ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: FIELD_GRADIENT }}
        />
      ) : null}

      {label}
      <Arrow />

      {interactive ? (
        // Same content, light, clipped to the field — so only the glyphs the
        // dark field covers invert, rather than the whole label on hover.
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2.5 text-[rgb(var(--landing-light-rgb))]"
          style={{ maskImage: MASK_GRADIENT, WebkitMaskImage: MASK_GRADIENT }}
        >
          {label}
          <Arrow />
        </span>
      ) : null}
    </button>
  );
}
