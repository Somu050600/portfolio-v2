"use client";

import gsap from "gsap";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { IntroContext, type IntroPhase } from "./intro-context";
import SignatureSvg from "./SignatureSvg";

const SESSION_KEY = "introSeen";

function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export default function IntroProvider({ children }: { children: ReactNode }) {
  // Render the overlay on first paint so first-time visitors never see the
  // site flash; returning visitors get it removed pre-paint in the effect.
  const [phase, setPhase] = useState<IntroPhase>("covered");
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (sessionStorage.getItem(SESSION_KEY) === "true" || reducedMotion) {
      sessionStorage.setItem(SESSION_KEY, "true");
      // Intentional pre-paint setState: useLayoutEffect runs before the browser
      // paints, so returning visitors never see the overlay flash.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("done");
      return;
    }

    const overlay = overlayRef.current;
    const path = pathRef.current;
    if (!overlay || !path) return;

    lockScroll(true);

    const length = path.getTotalLength();
    // Dash setup makes the stroke invisible; only then reveal the path.
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 1,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(SESSION_KEY, "true");
        lockScroll(false);
        setPhase("done");
      },
    });

    const progress = { value: 0 };

    tl.to(path, {
      strokeDashoffset: 0,
      duration: 2.4,
      ease: "power2.inOut",
    })
      .to(
        progress,
        {
          value: 100,
          duration: 2.4,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(
                Math.round(progress.value),
              );
            }
          },
        },
        0, // run alongside the stroke draw, same duration & ease
      )
      .to(
        overlay,
        {
          yPercent: -100,
          duration: 1.1,
          ease: "power4.inOut",
          onStart: () => setPhase("revealing"),
        },
        "+=0.3",
      );

    return () => {
      tl.kill();
      lockScroll(false);
    };
  }, []);

  return (
    <IntroContext.Provider value={phase}>
      {children}
      {phase !== "done" && (
        <div
          ref={overlayRef}
          data-intro-overlay
          aria-hidden="true"
          className="fixed inset-0 z-9999 flex items-center justify-center bg-[#0c0c10] will-change-transform"
        >
          <SignatureSvg pathRef={pathRef} />
          <div className="absolute bottom-8 right-8 font-mono text-sm tabular-nums text-[#ece8e1]/50 select-none md:bottom-10 md:right-12">
            <span ref={counterRef}>0</span>
            <span className="ml-0.5">%</span>
          </div>
        </div>
      )}
    </IntroContext.Provider>
  );
}
