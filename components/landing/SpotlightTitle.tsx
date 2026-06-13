"use client";

import { useEffect, useMemo, useRef } from "react";
import { landingConfig } from "@/lib/landing.config";
import {
  ACCENTS,
  THEME_DEFAULTS,
  type AccentKey,
} from "@/lib/theme.config";
import {
  LANDING_POINTER_EVENT,
  type LandingPointerDetail,
  useMediaQuery,
} from "./use-media-query";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Hex → "r,g,b" string for text-shadow.
function hexToRGB(hex: string): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

/**
 * The landing scene is force-dark, so the spotlight glow must always use the
 * DARK accent — not the globally-resolved --accent (which would be the light
 * accent when the site's theme is light). Read the visitor's chosen darkAccent
 * straight from the registry.
 */
function readDarkAccentRGB(): string {
  let key: AccentKey = THEME_DEFAULTS.darkAccent;
  try {
    const stored = JSON.parse(localStorage.getItem("theme-accents") ?? "{}");
    if (stored.darkAccent && stored.darkAccent in ACCENTS) {
      key = stored.darkAccent as AccentKey;
    }
  } catch {
    // fall back to default
  }
  return hexToRGB(ACCENTS[key].dark);
}

type CharState = {
  el: HTMLSpanElement;
  cx: number;
  cy: number;
  t: number;
};

/**
 * Per-character "flashlight" title. The landing cursor's `landing:pointer`
 * broadcast is the single pointer source; glyphs near the pointer brighten
 * and bloom with the dark accent glow, far glyphs dim. Pointer outside the
 * hero → full brightness. Reduced motion / no fine-pointer → static, bright.
 */
export default function SpotlightTitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = finePointer && !reducedMotion;

  // Stable per-character render (split once; spaces become fixed gaps).
  const chars = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;
    // Snapshot the ref array so cleanup references a stable value.
    const charEls = charRefs.current;

    const { radius, dimFloor, ease, glowCorePx, glowBloomPx } =
      landingConfig.spotlight;

    // Always the dark accent (landing is force-dark); re-read on accent change.
    let accentRGB = readDarkAccentRGB();
    const onAccentChange = () => {
      accentRGB = readDarkAccentRGB();
    };
    window.addEventListener("theme:accent-change", onAccentChange);

    const states: CharState[] = [];

    // Measure each char center once at rest, relative to the container.
    const measure = () => {
      const base = container.getBoundingClientRect();
      states.length = 0;
      for (const el of charEls) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        states.push({
          el,
          cx: r.left + r.width / 2 - base.left,
          cy: r.top + r.height / 2 - base.top,
          t: 1, // start at full brightness
        });
      }
    };

    let px = -9999;
    let py = -9999;
    let inside = false;
    let rafId = 0;

    // Pointer coords arrive in viewport space → convert to container-relative.
    const onPointer = (e: Event) => {
      const { x, y } = (e as CustomEvent<LandingPointerDetail>).detail;
      const base = container.getBoundingClientRect();
      px = x - base.left;
      py = y - base.top;
    };
    const onEnter = () => {
      inside = true;
    };
    const onLeave = () => {
      inside = false;
    };

    const tick = () => {
      for (const c of states) {
        const d = Math.hypot(c.cx - px, c.cy - py);
        const prox = inside ? clamp(1 - d / radius, 0, 1) : 1;
        c.t = lerp(c.t, prox, ease);
        c.el.style.opacity = (dimFloor + (1 - dimFloor) * c.t).toFixed(3);

        const g = inside ? clamp(1 - d / radius, 0, 1) : 0;
        c.el.style.textShadow =
          g > 0.02
            ? `0 0 ${(glowCorePx * g).toFixed(1)}px rgba(${accentRGB},${(0.9 * g).toFixed(3)}), 0 0 ${(glowBloomPx * g).toFixed(1)}px rgba(${accentRGB},${(0.5 * g).toFixed(3)})`
            : "none";
      }
      rafId = requestAnimationFrame(tick);
    };

    // Debounced re-measure on resize (font metrics shift with layout).
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 150);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    // Measure only after the real font loads — fallback metrics misalign.
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      measure();
      rafId = requestAnimationFrame(tick);
    });

    window.addEventListener(LANDING_POINTER_EVENT, onPointer);
    container.addEventListener("pointerenter", onEnter);
    container.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener(LANDING_POINTER_EVENT, onPointer);
      window.removeEventListener("theme:accent-change", onAccentChange);
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      // Reset inline styles so a remount starts clean.
      for (const el of charEls) {
        if (el) {
          el.style.opacity = "";
          el.style.textShadow = "";
        }
      }
    };
  }, [enabled, chars]);

  return (
    <h1 ref={containerRef} aria-label={text} className={className}>
      {chars.map((ch, i) => (
        <span
          key={i}
          ref={(el) => {
            charRefs.current[i] = el;
          }}
          aria-hidden="true"
          className="inline-block will-change-[opacity]"
          // Preserve spaces as real gaps (collapsed otherwise on inline-block).
          style={ch === " " ? { whiteSpace: "pre" } : undefined}
        >
          {ch}
        </span>
      ))}
    </h1>
  );
}
