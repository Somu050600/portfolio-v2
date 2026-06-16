"use client";

import { componentAttrs } from "@/lib/build-mode";
import { profile } from "@/lib/profile.config";
import gsap from "gsap";
import { useCallback, useLayoutEffect, useRef } from "react";

export default function WorkHero() {
  const rootRef = useRef<HTMLElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const play = useCallback(() => {
    const lines =
      rootRef.current?.querySelectorAll<HTMLElement>("[data-hero-line]");
    if (!lines?.length) return;

    tweenRef.current?.kill();

    // Always leave the lines visible — clearing the transform on both normal
    // completion and interruption (Strict Mode remount, page transition, or the
    // replay killing this tween) so they can never stay clipped behind the mask.
    const reveal = () => gsap.set(lines, { clearProps: "transform" });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return;
    }

    tweenRef.current = gsap.fromTo(
      lines,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.12,
        delay: 0.5,
        onComplete: reveal,
        onInterrupt: reveal,
      },
    );
  }, []);

  // Play on mount (initial load + remount on navigation into /home).
  useLayoutEffect(() => {
    const root = rootRef.current;
    play();
    return () => {
      tweenRef.current?.kill();
      const lines = root?.querySelectorAll<HTMLElement>("[data-hero-line]");
      // Clear transforms so lines aren't stuck off-screen on remount.
      if (lines?.length) gsap.set(lines, { clearProps: "transform" });
    };
  }, [play]);

  return (
    <header
      ref={rootRef}
      className="px-6 pt-14 pb-10 md:px-12 md:pt-20 md:pb-12 lg:px-16"
      {...componentAttrs(
        "WorkHero",
        "Front-door headline — GSAP line-mask reveal, replays after page transition.",
      )}
    >
      <h1 className="max-w-3xl font-serif text-4xl font-light tracking-tight text-ink md:text-6xl">
        {profile.hero.headline.map((line) => (
          <span key={line} className="block overflow-hidden">
            <span data-hero-line className="block">
              {line}
            </span>
          </span>
        ))}
      </h1>
      <p className="mt-6 max-w-xl font-mono text-xs leading-relaxed tracking-wide text-ink-dim md:text-sm">
        {profile.hero.guide}
      </p>
    </header>
  );
}
