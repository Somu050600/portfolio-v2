"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

/**
 * Simulated default View Transition: the visible page cross-fades to the other.
 * Each Run alternates direction (A↔B).
 */
export default function CrossFade({ runToken }: { runToken: number }) {
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

    const fade = (out: HTMLElement, inn: HTMLElement) => {
      gsap.killTweensOf([out, inn]);
      if (reduced) {
        gsap.set(out, { opacity: 0 });
        gsap.set(inn, { opacity: 1 });
        return;
      }
      gsap.to(out, { opacity: 0, duration: 0.55, ease: "power1.inOut" });
      gsap.to(inn, { opacity: 1, duration: 0.55, ease: "power1.inOut" });
    };

    if (first.current) {
      first.current = false;
      gsap.set(a, { opacity: 1 });
      gsap.set(b, { opacity: 0 });
      fade(a, b); // initial A → B
      showingB.current = true;
      return;
    }

    if (showingB.current) {
      fade(b, a);
      showingB.current = false;
    } else {
      fade(a, b);
      showingB.current = true;
    }
  }, [runToken]);

  return (
    <div className="relative h-44 w-[260px] max-w-full">
      <PageA ref={aRef} />
      <PageB ref={bRef} />
    </div>
  );
}

/** Article layout. */
function PageA({ ref }: { ref: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className="absolute inset-0 flex flex-col gap-2 rounded-lg border border-border-color bg-elevated p-3 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
          Page A
        </span>
        <span className="h-2 w-2 rounded-full bg-ink-faint" />
      </div>
      <div className="h-16 rounded bg-ink/10" />
      <div className="h-2 w-3/4 rounded bg-ink/10" />
      <div className="h-2 w-1/2 rounded bg-ink/10" />
    </div>
  );
}

/** Gallery / grid layout, visibly different from A. */
function PageB({ ref }: { ref: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className="absolute inset-0 flex flex-col gap-2 rounded-lg border border-border-color bg-elevated p-3 opacity-0 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
          Page B
        </span>
        <span className="h-2 w-2 rounded-full bg-accent" />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2">
        <div className="rounded bg-accent/20" />
        <div className="rounded bg-accent/15" />
        <div className="rounded bg-accent/15" />
        <div className="rounded bg-accent/20" />
      </div>
    </div>
  );
}
