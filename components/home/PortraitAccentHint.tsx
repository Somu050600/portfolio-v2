"use client";

import { ACCENTS, type AccentKey } from "@/lib/theme.config";
import { cn } from "@/lib/utils";
import { useEffect, useRef, type RefObject } from "react";
import { useIdleReveal } from "./use-idle-reveal";

/**
 * Two presets far enough from each other, and from most defaults, that one
 * glance at the shirt is enough to see what changed.
 */
const DEMO_ACCENTS: AccentKey[] = ["cyan", "terracotta"];
/** Matches the tint layers' own transition, so each step lands before the next. */
const STEP_MS = 1050;

function accentValue(key: AccentKey, dark: boolean): string {
  const accent = ACCENTS[key];
  return dark ? accent.dark : accent.light;
}

/**
 * The portrait's shirt is masked and filled with `--accent`, which almost
 * nobody discovers because the theme control sits in the site chrome, and on
 * small screens inside a closed menu.
 *
 * After a pause this plays the effect on the portrait itself, then names where
 * the switch lives. Once per browser, killed by the first sign of intent.
 */
export default function PortraitAccentHint({
  figureRef,
}: {
  figureRef: RefObject<HTMLElement | null>;
}) {
  const visible = useIdleReveal({
    id: "portrait-accent",
    subjectRef: figureRef,
  });
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const figure = figureRef.current;
    if (!visible || !figure) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Scoped to this element, so the site's real accent is never touched: the
    // tint layers live inside the figure and resolve `--accent` from here.
    const dark = document.documentElement.classList.contains("dark");
    const restore = () => figure.style.removeProperty("--accent");

    figure.style.setProperty("--accent", accentValue(DEMO_ACCENTS[0], dark));
    timersRef.current = [
      window.setTimeout(
        () =>
          figure.style.setProperty(
            "--accent",
            accentValue(DEMO_ACCENTS[1], dark),
          ),
        STEP_MS,
      ),
      window.setTimeout(restore, STEP_MS * 2),
    ];

    return () => {
      timersRef.current.forEach(window.clearTimeout);
      timersRef.current = [];
      restore();
    };
  }, [figureRef, visible]);

  return (
    <div
      role="status"
      aria-live="polite"
      // Claimed while on screen so another hint (Pixel) holds its turn.
      data-discovery-hint={visible ? "portrait-accent" : undefined}
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-1 flex flex-col gap-0.5 px-3.5 pt-8 pb-3",
        "bg-[linear-gradient(180deg,transparent,color-mix(in_oklab,var(--surface)_92%,transparent)_58%)]",
        "transition-[opacity,transform] duration-500 ease-(--ease-out-soft) motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
      )}
    >
      {/* Mounted only while shown, so the live region has a change to announce
          rather than text that was always there. */}
      {visible && (
        <>
          <p
            aria-hidden="true"
            className="font-accent-hand text-[17px] leading-tight text-ink"
          >
            my shirt wears your accent
          </p>
          <p
            aria-hidden="true"
            className="font-mono text-metadata leading-none tracking-[0.12em] text-ink-dim uppercase"
          >
            {/* The control is in the rail on desktop, behind MENU below it. */}
            <span className="hidden lg:inline">↙ it&apos;s in the sidebar</span>
            <span className="lg:hidden">↗ tap MENU, then the sun</span>
          </p>
          <span className="sr-only">
            The shirt in this portrait is tinted with the site accent colour.
            The theme controls are in the site menu.
          </span>
        </>
      )}
    </div>
  );
}
