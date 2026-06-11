"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import SignatureSvg from "@/components/intro/SignatureSvg";
import { landingConfig } from "@/lib/landing.config";

const SESSION_KEY = "introSeen";

function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

/**
 * Layer A: full-viewport overlay playing the existing signature brush-reveal,
 * then sliding up to reveal the welcome scene beneath. Run-once gating via
 * env flag + sessionStorage; reduced motion skips entirely. The pre-paint
 * script in layout.tsx hides the overlay for returning visitors before
 * hydration (html[data-intro-seen]).
 */
export default function IntroOverlay({
  strokePath,
  fillContent,
}: {
  strokePath: string;
  fillContent: string;
}) {
  // Rendered on first paint so the scene never flashes before the intro.
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const { runOncePerSession, drawMs, holdMs, slideUpMs, slideUpEase } =
      landingConfig.intro;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const alreadySeen =
      runOncePerSession && sessionStorage.getItem(SESSION_KEY) === "true";

    if (alreadySeen || reducedMotion) {
      // Intentional pre-paint setState: useLayoutEffect runs before the
      // browser paints, so returning visitors never see the overlay flash.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDone(true);
      return;
    }

    const overlay = overlayRef.current;
    const path = pathRef.current;
    if (!overlay || !path) return;

    lockScroll(true);

    const length = path.getTotalLength();
    // Dash setup closes the mask; only then reveal the driver path.
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 1,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        if (runOncePerSession) sessionStorage.setItem(SESSION_KEY, "true");
        lockScroll(false);
        setDone(true);
      },
    });

    const progress = { value: 0 };

    tl.to(path, {
      strokeDashoffset: 0,
      duration: drawMs / 1000,
      ease: "power2.inOut",
    })
      .to(
        progress,
        {
          value: 100,
          duration: drawMs / 1000,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(
                Math.round(progress.value),
              );
            }
          },
        },
        0, // run alongside the brush reveal, same duration & ease
      )
      .to(
        overlay,
        {
          yPercent: -100,
          duration: slideUpMs / 1000,
          ease: slideUpEase,
        },
        `+=${holdMs / 1000}`,
      );

    return () => {
      tl.kill();
      lockScroll(false);
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      data-intro-overlay
      aria-hidden="true"
      className="fixed inset-0 z-9999 flex items-center justify-center bg-[#0c0c10] will-change-transform"
    >
      <SignatureSvg pathRef={pathRef} strokePath={strokePath} fillContent={fillContent} />
      <div className="absolute bottom-8 right-8 font-mono text-sm tabular-nums text-[#ece8e1]/50 select-none md:bottom-10 md:right-12">
        <span ref={counterRef}>0</span>
        <span className="ml-0.5">%</span>
      </div>
    </div>
  );
}
