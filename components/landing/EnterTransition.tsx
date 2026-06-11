"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { landingConfig } from "@/lib/landing.config";

/**
 * Enter transition: a disc in the destination's background color grows out of
 * the CTA until it covers the viewport, then we navigate. The disc lives on
 * <html> (outside React) so it survives the route swap, then fades out to
 * cross-reveal /home underneath.
 *
 * Reduced motion: instant navigate, no disc.
 */
export function useEnterTransition(target: string) {
  const router = useRouter();
  const triggeredRef = useRef(false);

  useEffect(() => {
    router.prefetch(target);
  }, [router, target]);

  return useCallback(
    async (originEl?: HTMLElement | null) => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reducedMotion) {
        router.push(target);
        return;
      }

      const rect = originEl?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

      const { coverMs, coverEase, revealMs } = landingConfig.enterTransition;

      const disc = document.createElement("div");
      disc.setAttribute("aria-hidden", "true");
      disc.style.cssText = [
        "position:fixed",
        `left:${cx}px`,
        `top:${cy}px`,
        "width:260vmax",
        "height:260vmax",
        "margin-left:-130vmax",
        "margin-top:-130vmax",
        "background:var(--background)",
        "border-radius:50%",
        "z-index:9990",
        "pointer-events:none",
        "transform-origin:center center",
        "transform:scale(0.01)",
        "will-change:transform",
      ].join(";");
      document.documentElement.appendChild(disc);

      const expand = disc.animate(
        [{ transform: "scale(0.01)" }, { transform: "scale(1)" }],
        { duration: coverMs, easing: coverEase, fill: "forwards" },
      );

      try {
        await expand.finished;
      } catch {
        // Animation aborted (e.g. tab backgrounded) — navigate anyway.
      }

      router.push(target);

      // Cross-reveal: give the new route a beat to paint beneath the disc,
      // then fade the disc out and clean up.
      window.setTimeout(async () => {
        const fade = disc.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: revealMs,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        });
        try {
          await fade.finished;
        } catch {
          // Aborted — clean up regardless.
        }
        disc.remove();
      }, 250);
    },
    [router, target],
  );
}
