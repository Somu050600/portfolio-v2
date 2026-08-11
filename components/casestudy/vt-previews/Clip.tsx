"use client";

import { useEffect, useRef } from "react";
import MockPage from "./MockPage";

const clipAt = (r: number) => `circle(${r}% at 50% 50%)`;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Simulated clip-path reveal: the incoming page grows from the center as a
 * circle, covering the current one. Each Run reveals the other page. The clip
 * is driven by a raw rAF loop (no tweened object, because React Compiler freezes those,
 * which is why a gsap-object tween silently no-ops here).
 */
export default function Clip({ runToken }: { runToken: number }) {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const shownB = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const reveal = (incoming: HTMLElement, outgoing: HTMLElement) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      outgoing.style.clipPath = "none";
      outgoing.style.zIndex = "1";
      incoming.style.zIndex = "2";
      incoming.style.clipPath = clipAt(0);

      if (reduced) {
        incoming.style.clipPath = clipAt(150);
        return;
      }

      const startedAt = performance.now();
      const dur = 620;
      const tick = (now: number) => {
        const t = Math.min((now - startedAt) / dur, 1);
        incoming.style.clipPath = clipAt(easeInOut(t) * 150);
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    if (first.current) {
      first.current = false;
      reveal(b, a);
      shownB.current = true;
    } else if (shownB.current) {
      reveal(a, b);
      shownB.current = false;
    } else {
      reveal(b, a);
      shownB.current = true;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [runToken]);

  return (
    <div className="relative h-44 w-[260px] max-w-full overflow-hidden rounded-lg border border-border-color">
      <div ref={aRef} className="absolute inset-0">
        <MockPage tone="a" label="Page A" />
      </div>
      <div
        ref={bRef}
        className="absolute inset-0"
        style={{ clipPath: clipAt(0) }}
      >
        <MockPage tone="b" label="Page B" />
      </div>
    </div>
  );
}
