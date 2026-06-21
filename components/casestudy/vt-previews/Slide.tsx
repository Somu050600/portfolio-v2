"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import MockPage from "./MockPage";

/**
 * Simulated directional slide: the old page pushes up and out, the new one
 * enters from below. Mirrors this site's home-section slide.
 */
export default function Slide({ runToken }: { runToken: number }) {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const showingB = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const go = (toB: boolean) => {
      gsap.killTweensOf([a, b]);
      const out = toB ? a : b;
      const inEl = toB ? b : a;
      if (reduced) {
        gsap.set(out, { yPercent: -100 });
        gsap.set(inEl, { yPercent: 0 });
        return;
      }
      gsap.set(inEl, { yPercent: 100 });
      gsap.to(out, { yPercent: -100, duration: 0.5, ease: "power2.inOut" });
      gsap.to(inEl, { yPercent: 0, duration: 0.5, ease: "power2.inOut" });
    };

    if (first.current) {
      first.current = false;
      gsap.set(a, { yPercent: 0 });
      gsap.set(b, { yPercent: 100 });
      go(true);
      showingB.current = true;
      return;
    }
    go(!showingB.current);
    showingB.current = !showingB.current;
  }, [runToken]);

  return (
    <div className="relative h-44 w-[260px] max-w-full overflow-hidden rounded-lg border border-border-color">
      <div ref={aRef} className="absolute inset-0">
        <MockPage tone="a" label="Page A" />
      </div>
      <div ref={bRef} className="absolute inset-0">
        <MockPage tone="b" label="Page B" />
      </div>
    </div>
  );
}
