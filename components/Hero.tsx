"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useIntroPhase } from "./intro/intro-context";

const LINES = ["Somu", "Software engineer &", "builder of things."];

export default function Hero() {
  const phase = useIntroPhase();
  const rootRef = useRef<HTMLElement>(null);
  const playedRef = useRef(false);

  useLayoutEffect(() => {
    const lines = rootRef.current?.querySelectorAll<HTMLElement>(
      "[data-hero-line]"
    );
    if (!lines?.length) return;

    if (phase === "covered") {
      // Safe to hide: the overlay is covering the page.
      gsap.set(lines, { yPercent: 110 });
      return;
    }

    if (phase === "revealing" && !playedRef.current) {
      playedRef.current = true;
      const tween = gsap.to(lines, {
        yPercent: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.12,
        delay: 0.15,
      });
      return () => {
        tween.kill();
      };
    }

    if (phase === "done" && !playedRef.current) {
      // Intro was skipped (already seen / reduced motion): show instantly.
      playedRef.current = true;
      gsap.set(lines, { yPercent: 0 });
    }
  }, [phase]);

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
