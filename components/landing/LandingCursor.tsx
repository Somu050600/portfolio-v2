"use client";

import { useEffect, useRef } from "react";
import { landingConfig } from "@/lib/landing.config";
import {
  LANDING_POINTER_EVENT,
  type LandingPointerDetail,
  useMediaQuery,
} from "./use-media-query";

/**
 * Glowing white cursor for the landing scene. Doubles as the single source of
 * truth for pointer position: every frame it broadcasts smoothed coords so the
 * hero shove + parallax read one feed instead of attaching their own listeners.
 *
 * Pattern: refs not state, one rAF loop (idle-stopped), transform-only
 * translate3d, lerped trailing, pointer-events none.
 */
export default function LandingCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = finePointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    document.documentElement.setAttribute("data-landing-cursor", "");

    const lerp = landingConfig.interaction.cursorLerp;
    let targetX = 0;
    let targetY = 0;
    let currX = 0;
    let currY = 0;
    let initialized = false;
    let rafId = 0;
    let idleTimer = 0;

    cursor.style.opacity = "0";

    const tick = () => {
      currX += (targetX - currX) * lerp;
      currY += (targetY - currY) * lerp;
      cursor.style.transform = `translate3d(${currX.toFixed(2)}px, ${currY.toFixed(2)}px, 0)`;
      window.dispatchEvent(
        new CustomEvent<LandingPointerDetail>(LANDING_POINTER_EVENT, {
          detail: { x: currX, y: currY },
        }),
      );
      rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };
    const resetIdle = () => {
      clearTimeout(idleTimer);
      startLoop();
      idleTimer = window.setTimeout(stopLoop, 500);
    };

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!initialized) {
        currX = targetX;
        currY = targetY;
        cursor.style.opacity = "1";
        initialized = true;
      }
      resetIdle();
    };

    const onMouseLeave = () => {
      cursor.style.opacity = "0";
    };
    const onMouseEnter = () => {
      cursor.style.opacity = initialized ? "1" : "0";
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
        clearTimeout(idleTimer);
      } else if (initialized) {
        cursor.style.opacity = "1";
        resetIdle();
      }
    };

    // Grow over interactive elements.
    const onMouseOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest?.("a, button, [role='button']");
      cursor.dataset.mode = interactive ? "link" : "dot";
    };

    startLoop();
    window.addEventListener("pointermove", onPointerMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("mouseover", onMouseOver);

    return () => {
      stopLoop();
      clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("mouseover", onMouseOver);
      document.documentElement.removeAttribute("data-landing-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      data-mode="dot"
      className="landing-cursor pointer-events-none fixed left-0 top-0 z-50 will-change-transform"
    >
      <div className="landing-cursor__shape" />
    </div>
  );
}
