"use client";

import { useEffect, type RefObject } from "react";

/* ---------------------------------------------------------------------------
   Tunables
   --------------------------------------------------------------------------- */

/** Influence radius, derived from headline width and clamped to this range. */
const RADIUS_MIN = 120;
const RADIUS_MAX = 220;
const RADIUS_FROM_WIDTH = 0.28;
/** Peak displacement for a character directly under the pointer, px. */
const MAX_DISPLACEMENT = 10;
/**
 * Falloff curve. Lower spreads the push further out; at 1.8 the field collapsed
 * to under 1px by 150px, which read as nothing against 100px glyphs.
 */
const FALLOFF_EXPONENT = 1.45;
/** Pointer smoothing, then character catch-up and return rates. */
const POINTER_LERP = 0.16;
const MOVE_LERP = 0.16;
const RETURN_LERP = 0.12;
/** Below this, snap to rest and stop writing. */
const EPSILON = 0.01;

type Char = {
  el: HTMLElement;
  /** Original centre in viewport coords, excluding any applied displacement. */
  ox: number;
  oy: number;
  x: number;
  y: number;
  mix: number;
  /** Last values written to the DOM, to skip redundant style writes. */
  wx: number;
  wy: number;
  wmix: number;
  accent: boolean;
};

type Options = {
  headlineRef: RefObject<HTMLElement | null>;
  /** False on touch, coarse pointers and under prefers-reduced-motion. */
  enabled: boolean;
};

/**
 * Wide, soft magnetic repulsion across the headline: every character slides
 * directly away from the pointer, strongest nearest it, and shifts toward the
 * accent by the same proximity. One rAF loop drives every character; nothing
 * here touches React state.
 */
export function useHeadlineMagnetics({ headlineRef, enabled }: Options) {
  useEffect(() => {
    const headline = headlineRef.current;
    if (!headline || !enabled) return;

    const chars: Char[] = Array.from(
      headline.querySelectorAll<HTMLElement>(".landing-char"),
    ).map((el) => ({
      el,
      ox: 0,
      oy: 0,
      x: 0,
      y: 0,
      mix: 0,
      wx: 0,
      wy: 0,
      wmix: 0,
      accent: el.classList.contains("landing-char--accent"),
    }));

    if (chars.length === 0) return;

    let radius = RADIUS_MIN;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let active = false;
    let rafId = 0;
    let measureQueued = false;

    /**
     * Reads each character's resting centre. The applied displacement is
     * subtracted rather than cleared first, so measuring never forces a reflow
     * of transformed text or fights the running animation.
     */
    const measure = () => {
      measureQueued = false;
      for (const c of chars) {
        const rect = c.el.getBoundingClientRect();
        c.ox = rect.left + rect.width / 2 - c.x;
        c.oy = rect.top + rect.height / 2 - c.y;
      }
      const width = headline.getBoundingClientRect().width;
      radius = Math.min(
        RADIUS_MAX,
        Math.max(RADIUS_MIN, width * RADIUS_FROM_WIDTH),
      );
    };

    const queueMeasure = () => {
      if (measureQueued) return;
      measureQueued = true;
      requestAnimationFrame(measure);
    };

    const write = (c: Char) => {
      if (
        Math.abs(c.x - c.wx) < EPSILON &&
        Math.abs(c.y - c.wy) < EPSILON &&
        Math.abs(c.mix - c.wmix) < EPSILON
      ) {
        return;
      }

      c.wx = c.x;
      c.wy = c.y;
      c.wmix = c.mix;

      if (c.x === 0 && c.y === 0 && c.mix === 0) {
        c.el.style.removeProperty("translate");
        c.el.style.removeProperty("--char-mix");
        return;
      }

      // Written straight to the `translate` property rather than through a
      // custom property the stylesheet has to consume, one less layer between
      // this loop and the pixels.
      c.el.style.translate = `${c.x.toFixed(2)}px ${c.y.toFixed(2)}px`;
      // Accent characters are already accent-coloured; only ink chars mix.
      if (!c.accent) {
        c.el.style.setProperty("--char-mix", c.mix.toFixed(3));
      }
    };

    const tick = () => {
      pointerX += (targetX - pointerX) * POINTER_LERP;
      pointerY += (targetY - pointerY) * POINTER_LERP;

      const lerp = active ? MOVE_LERP : RETURN_LERP;
      let busy = false;

      for (const c of chars) {
        let tx = 0;
        let ty = 0;
        let tmix = 0;

        if (active) {
          const dx = c.ox - pointerX;
          const dy = c.oy - pointerY;
          const distance = Math.hypot(dx, dy);
          if (distance < radius) {
            // Pure repulsion along pointer→character; no oscillating term.
            const proximity = 1 - distance / radius;
            const eased = Math.pow(proximity, FALLOFF_EXPONENT);
            const push = eased * MAX_DISPLACEMENT;
            const unit = distance || 1;
            tx = (dx / unit) * push;
            ty = (dy / unit) * push;
            tmix = eased;
          }
        }

        c.x += (tx - c.x) * lerp;
        c.y += (ty - c.y) * lerp;
        c.mix += (tmix - c.mix) * lerp;

        if (
          Math.abs(tx - c.x) < EPSILON &&
          Math.abs(ty - c.y) < EPSILON &&
          Math.abs(tmix - c.mix) < EPSILON
        ) {
          c.x = tx;
          c.y = ty;
          c.mix = tmix;
        } else {
          busy = true;
        }

        write(c);
      }

      // Keep running while the pointer is live so it keeps tracking; otherwise
      // stop as soon as every character has settled back home.
      if (active || busy) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      rafId = 0;
      headline.classList.remove("landing-headline-magnetic");
    };

    const start = () => {
      if (rafId) return;
      headline.classList.add("landing-headline-magnetic");
      rafId = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (!active) {
        // Seed at the pointer so the field does not sweep in from 0,0.
        pointerX = event.clientX;
        pointerY = event.clientY;
        active = true;
      }
      targetX = event.clientX;
      targetY = event.clientY;
      start();
    };

    const release = () => {
      if (!active) return;
      active = false;
      start();
    };

    const onPointerOut = (event: PointerEvent) => {
      // relatedTarget null means the pointer left the document entirely.
      if (event.relatedTarget === null) release();
    };

    const onVisibility = () => {
      if (document.hidden) release();
    };

    measure();
    if (document.fonts?.status !== "loaded") {
      // Metrics change when the headline face swaps in.
      void document.fonts?.ready.then(queueMeasure);
    }

    const observer = new ResizeObserver(queueMeasure);
    observer.observe(headline);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("blur", release);
    window.addEventListener("scroll", queueMeasure, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", release);
      window.removeEventListener("scroll", queueMeasure);
      document.removeEventListener("visibilitychange", onVisibility);
      headline.classList.remove("landing-headline-magnetic");
      for (const c of chars) {
        c.el.style.removeProperty("--char-x");
        c.el.style.removeProperty("--char-y");
        c.el.style.removeProperty("--char-mix");
      }
    };
  }, [headlineRef, enabled]);
}
