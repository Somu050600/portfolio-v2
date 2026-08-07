"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

const LINES = ["Somu", "Software engineer &", "builder of things."];

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const lines =
      rootRef.current?.querySelectorAll<HTMLElement>("[data-hero-line]");
    if (!lines?.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.from(lines, {
      yPercent: 110,
      duration: 1,
      ease: "power4.out",
      stagger: 0.12,
      delay: 0.15,
    });

    return () => {
      tween.kill();
      // Clear the transform so lines aren't stuck off-screen on remount
      // (e.g. after a view-transition re-renders this component).
      gsap.set(lines, { clearProps: "transform" });
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="flex min-h-screen flex-col justify-center gap-2 px-8 md:px-20"
    >
      {LINES.map((line, i) => (
        <div key={line} className="overflow-hidden">
          <h1
            data-hero-line
            className={
              i === 0
                ? "font-display text-display-hero font-semibold tracking-[-0.035em]"
                : "font-display text-page-title font-medium text-neutral-400"
            }
          >
            {line}
          </h1>
        </div>
      ))}
    </section>
  );
}
