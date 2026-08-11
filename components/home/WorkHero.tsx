"use client";

import { componentAttrs } from "@/lib/build-mode";
import { profile } from "@/lib/profile.config";
import { typeStyles } from "@/lib/typography";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useCallback, useLayoutEffect, useRef } from "react";

export function createWorkHeroLineReveal(lines: object[]) {
  const reveal = () => gsap.set(lines, { clearProps: "transform" });

  return gsap.fromTo(
    lines,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: 1,
      ease: "power4.out",
      delay: 0.5,
      onComplete: reveal,
      onInterrupt: reveal,
    },
  );
}

export default function WorkHero() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const play = useCallback(() => {
    const headline = headlineRef.current;
    if (!headline) return;

    tweenRef.current?.kill();
    splitRef.current?.revert();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(SplitText);
    splitRef.current = SplitText.create(headline, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: ({ lines }) => {
        tweenRef.current?.kill();
        tweenRef.current = createWorkHeroLineReveal(lines);
        return tweenRef.current;
      },
    });
  }, []);

  // Play on mount (initial load + remount on navigation into /home).
  useLayoutEffect(() => {
    play();
    return () => {
      tweenRef.current?.kill();
      splitRef.current?.revert();
      splitRef.current = null;
    };
  }, [play]);

  return (
    <header
      ref={rootRef}
      className="mx-auto w-[min(calc(100%-2rem),940px)] pt-14 pb-10 md:pt-20 md:pb-12"
      {...componentAttrs(
        "WorkHero",
        "Front-door headline: GSAP line-mask reveal, replays after page transition.",
      )}
    >
      <h1
        ref={headlineRef}
        className={`${typeStyles.displayHero} max-w-3xl text-balance text-ink`}
      >
        {profile.hero.headline}
      </h1>
      <p className={`${typeStyles.bodySmall} mt-6 max-w-xl text-ink-dim`}>
        {profile.hero.guide}
      </p>
    </header>
  );
}
