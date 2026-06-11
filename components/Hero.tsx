"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

const LINES = ["Somu", "Software engineer &", "builder of things."];

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const lines = rootRef.current?.querySelectorAll<HTMLElement>(
      "[data-hero-line]",
    );
    if (!lines?.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // gsap.from in a layout effect runs pre-paint — no flash of unhidden text.
    const tween = gsap.from(lines, {
      yPercent: 110,
      duration: 1,
      ease: "power4.out",
      stagger: 0.12,
      delay: 0.15,
    });

    return () => {
      tween.kill();
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
                ? "text-6xl font-bold tracking-tight md:text-8xl"
                : "text-3xl font-light text-neutral-400 md:text-5xl"
            }
          >
            {line}
          </h1>
        </div>
      ))}
    </section>
  );
}
