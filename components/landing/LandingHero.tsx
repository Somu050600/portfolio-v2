"use client";

import { landingConfig } from "@/lib/landing.config";
import { usePageTransition } from "@/lib/page-transition-context";
import { profile } from "@/lib/profile.config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import FocusFrame from "./FocusFrame";
import {
  captureElementCenter,
  resolveFocusStatus,
  splitFinalWord,
} from "./landing-interactions";
import { useLandingEasterEggs } from "./use-landing-easter-eggs";
import { useMediaQuery } from "./use-media-query";
import { useSpotlightTracking } from "./use-spotlight-tracking";

type LandingHeroProps = {
  background: ReactNode;
};

const technicalRows = [
  ["spotlight", "CSS radial-gradient"],
  ["tracking", "requestAnimationFrame"],
  ["pattern", "SVG guilloché"],
  ["transition", "native View Transition API"],
  ["reduced motion", "supported"],
  ["rendering", "no WebGL"],
] as const;

/** [key, label, placement + the opacity var the spotlight loop writes] */
const quadrantLabels = [
  ["tl", "DESIGN SYSTEMS", "top-[18%] left-[9%] opacity-(--quadrant-1)"],
  ["tr", "PERFORMANCE", "top-[18%] right-[9%] opacity-(--quadrant-2)"],
  ["bl", "PHOTOGRAPHY", "bottom-[17%] left-[9%] opacity-(--quadrant-3)"],
  ["br", "VIEW TRANSITIONS", "right-[9%] bottom-[17%] opacity-(--quadrant-4)"],
] as const;

/** Used by four nav items — one string beats four copies of the same 16 classes. */
const navLinkClass =
  "relative text-(--landing-ink) outline-none transition-colors duration-180 hover:text-(--landing-accent) focus-visible:text-(--landing-accent) after:absolute after:inset-x-0 after:-bottom-1.25 after:h-px after:origin-center after:translate-y-0.5 after:scale-x-[0.7] after:bg-(--landing-accent) after:opacity-0 after:transition-[opacity,transform] after:duration-180 hover:after:translate-y-0 hover:after:scale-x-100 hover:after:opacity-100 focus-visible:after:translate-y-0 focus-visible:after:scale-x-100 focus-visible:after:opacity-100";

export default function LandingHero({ background }: LandingHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const cover = usePageTransition();
  const systemReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [focusedLine, setFocusedLine] = useState<number | null>(null);
  const [ctaActive, setCtaActive] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [returnedToCentre, setReturnedToCentre] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const motionDisabled = motionOverride ?? systemReducedMotion;
  const interactiveLine = focusedLine ?? hoveredLine;
  const {
    lockedLine,
    technicalVisible,
    semanticVisible,
    temperature,
    cycleTemperature,
  } = useLandingEasterEggs(interactiveLine);
  const displayedLine = lockedLine ?? interactiveLine;

  useSpotlightTracking({
    rootRef,
    motionDisabled,
    activeLine: displayedLine,
    anchoredLine: lockedLine ?? focusedLine,
    ctaActive,
    transitioning,
  });

  useEffect(() => {
    router.prefetch(landingConfig.hero.ctaTarget);
  }, [router]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const focusStatus = useMemo(
    () =>
      resolveFocusStatus({
        reducedMotion: motionDisabled,
        locked: lockedLine !== null,
        line: displayedLine,
        returned: returnedToCentre,
      }),
    [displayedLine, lockedLine, motionDisabled, returnedToCentre],
  );

  const activateExplore = useCallback(() => {
    if (transitioning) return;

    // Resolve the button's viewport centre synchronously so every browser
    // seeds the native reveal from the same stable point.
    const originPoint = captureElementCenter(ctaRef.current);

    setTransitioning(true);
    setCtaActive(true);
    setReturnedToCentre(false);

    cover({
      href: landingConfig.hero.ctaTarget,
      originPoint,
      originEl: ctaRef.current,
      reducedMotion: motionDisabled,
    });
  }, [cover, motionDisabled, transitioning]);

  const onDoubleClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;
    cycleTemperature();
  };

  const headline = landingConfig.hero.headline;

  return (
    <main
      ref={rootRef}
      className="landing-hero relative isolate min-h-svh overflow-hidden bg-(--landing-paper) text-(--landing-ink)"
      data-motion={motionDisabled ? "reduced" : "full"}
      data-temperature={temperature}
      data-semantic-label="<main>"
      data-semantic-visible={semanticVisible ? "" : undefined}
      data-transitioning={transitioning ? "" : undefined}
      onDoubleClick={onDoubleClick}
      onPointerEnter={() => setReturnedToCentre(false)}
      onPointerLeave={() => setReturnedToCentre(true)}
    >
      {background}
      <div
        aria-hidden="true"
        className="landing-spotlight pointer-events-none absolute inset-0 z-1"
      />

      <FocusFrame ctaActive={ctaActive} lockedLine={lockedLine} />

      {quadrantLabels.map(([quadrant, label, placement]) => (
        <span
          key={quadrant}
          aria-hidden="true"
          className={`pointer-events-none absolute z-4 font-mono text-[10px] tracking-[0.16em] text-(--landing-muted) transition-opacity duration-80 ease-linear max-[519px]:hidden ${placement}`}
        >
          {label}
        </span>
      ))}

      <header
        className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 py-6 sm:px-9 sm:py-8 lg:px-12"
        data-semantic-label="<header>"
      >
        <Link
          href="/home"
          className="font-mono text-sm font-medium tracking-[0.3em] text-(--landing-ink) uppercase outline-offset-6 transition-colors hover:text-(--landing-accent) focus-visible:outline-1 focus-visible:outline-(--landing-accent)"
        >
          SOMU
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 font-mono text-xs tracking-[0.08em] md:flex lg:gap-9"
          data-semantic-label="<nav>"
        >
          <Link className={navLinkClass} href="/home">
            Work
          </Link>
          <span className="group relative">
            <button
              type="button"
              aria-disabled="true"
              aria-describedby="photography-coming-soon"
              className={navLinkClass}
            >
              Photography
            </button>
            <span
              id="photography-coming-soon"
              className="pointer-events-none absolute top-[calc(100%+12px)] left-1/2 w-max -translate-x-1/2 -translate-y-0.5 text-[9px] tracking-[0.12em] text-(--landing-muted) uppercase opacity-0 transition-[opacity,transform] duration-180 group-hover:translate-y-0 group-hover:opacity-85 group-focus-within:translate-y-0 group-focus-within:opacity-85"
            >
              Coming soon
            </span>
          </span>
          <Link className={navLinkClass} href="/home/about">
            About
          </Link>
          <a
            className={navLinkClass}
            href={`mailto:${profile.contact.email}`}
          >
            Contact
          </a>
        </nav>

        <button
          type="button"
          aria-expanded={mobileNavOpen}
          aria-controls="landing-mobile-nav"
          onClick={() => setMobileNavOpen((open) => !open)}
          className="font-mono text-xs tracking-[0.14em] uppercase outline-offset-4 md:hidden"
        >
          {mobileNavOpen ? "Close" : "Menu"}
        </button>

        <nav
          id="landing-mobile-nav"
          aria-label="Mobile navigation"
          aria-hidden={!mobileNavOpen}
          className="invisible pointer-events-none absolute top-18 right-6 flex min-w-48 -translate-y-1.5 flex-col gap-[0.9rem] border border-(--landing-line) bg-[color-mix(in_srgb,var(--landing-paper)_94%,transparent)] p-5 font-mono text-xs tracking-[0.08em] text-(--landing-ink) opacity-0 shadow-[0_18px_50px_rgba(37,42,38,0.1)] backdrop-blur-md transition-[opacity,transform,visibility] duration-180 data-open:visible data-open:pointer-events-auto data-open:translate-y-0 data-open:opacity-100 md:hidden"
          data-open={mobileNavOpen ? "" : undefined}
        >
          <Link
            href="/home"
            onClick={() => setMobileNavOpen(false)}
            className="outline-offset-4 hover:text-(--landing-accent) focus-visible:text-(--landing-accent)"
          >
            Work
          </Link>
          <span
            aria-disabled="true"
            className="flex items-baseline justify-between gap-4"
          >
            Photography{" "}
            <small className="text-[8px] tracking-widest text-(--landing-muted) uppercase">
              Coming soon
            </small>
          </span>
          <Link
            href="/home/about"
            onClick={() => setMobileNavOpen(false)}
            className="outline-offset-4 hover:text-(--landing-accent) focus-visible:text-(--landing-accent)"
          >
            About
          </Link>
          <a
            className="outline-offset-4 hover:text-(--landing-accent) focus-visible:text-(--landing-accent)"
            href={`mailto:${profile.contact.email}`}
            onClick={() => setMobileNavOpen(false)}
          >
            Contact
          </a>
        </nav>
      </header>

      <section
        aria-labelledby="landing-headline"
        className="relative z-10 flex min-h-svh items-center px-6 py-28 sm:px-10 lg:px-16"
      >
        <div className="mx-auto w-full max-w-280 text-center">
          <h1
            id="landing-headline"
            className="font-landing text-balance text-[clamp(2.7rem,6.25vw,6.7rem)] leading-[1.16] font-normal tracking-[-0.015em] max-md:text-[clamp(2.55rem,11vw,4rem)]"
            data-active-line={displayedLine ?? undefined}
            data-semantic-label="<h1>"
          >
            {headline.map((line, index) => {
              const lineNumber = index + 1;
              const isFinalLine = index === headline.length - 1;
              const finalLineParts = isFinalLine ? splitFinalWord(line) : null;
              const active = displayedLine === lineNumber;
              const muted = displayedLine !== null && !active;

              return (
                <span
                  key={line}
                  tabIndex={0}
                  aria-label={`Focus line ${lineNumber}: ${line}`}
                  className={`block w-fit mx-auto text-(--landing-ink) outline-none transition-[opacity,transform,color] duration-300 focus-visible:outline-1 focus-visible:outline-offset-8 focus-visible:outline-(--landing-accent) ${
                    muted ? "opacity-50" : "opacity-100"
                  } ${active ? "-translate-y-0.5" : "translate-y-0"}`}
                  data-headline-line={lineNumber}
                  onPointerEnter={() => setHoveredLine(lineNumber)}
                  onPointerLeave={() => setHoveredLine(null)}
                  onFocus={() => setFocusedLine(lineNumber)}
                  onBlur={() => setFocusedLine(null)}
                >
                  {finalLineParts ? (
                    <>
                      {finalLineParts.leadingText
                        ? `${finalLineParts.leadingText} `
                        : null}
                      <em className="font-serif text-(--landing-accent) italic">
                        {finalLineParts.finalWord}
                      </em>
                    </>
                  ) : (
                    line
                  )}
                </span>
              );
            })}
          </h1>

          <div className="mt-8 flex flex-col items-center gap-3 font-mono sm:mt-10">
            <p className="text-xs tracking-[0.14em] text-(--landing-muted) uppercase sm:text-sm">
              {landingConfig.hero.role}
            </p>
            <p className="text-[10px] tracking-[0.08em] text-(--landing-muted) sm:text-xs">
              {landingConfig.hero.specialties}
            </p>
            <button
              ref={ctaRef}
              type="button"
              data-landing-cta
              onPointerEnter={() => setCtaActive(true)}
              onPointerLeave={() => {
                if (!transitioning) setCtaActive(false);
              }}
              onFocus={() => setCtaActive(true)}
              onBlur={() => {
                if (!transitioning) setCtaActive(false);
              }}
              onClick={activateExplore}
              className="group relative mt-4 inline-flex items-center gap-2 text-xs tracking-[0.2em] text-(--landing-accent) uppercase outline-offset-6 after:absolute after:inset-x-0 after:-bottom-1.25 after:h-px after:origin-left after:scale-x-[0.34] after:bg-current after:opacity-45 after:transition-[opacity,transform] after:duration-220 hover:after:scale-x-100 hover:after:opacity-100 focus-visible:after:scale-x-100 focus-visible:after:opacity-100 sm:text-sm"
            >
              {landingConfig.hero.ctaLabel}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </button>
          </div>
        </div>
      </section>

      <footer
        className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-5 px-6 py-6 font-mono sm:px-9 sm:py-8 lg:px-12"
        data-semantic-label="<footer>"
      >
        <p
          aria-live="polite"
          aria-atomic="true"
          className="max-w-[58vw] text-[10px] tracking-[0.16em] text-(--landing-muted) uppercase sm:text-[11px]"
        >
          {focusStatus}
        </p>

        <button
          type="button"
          aria-pressed={motionDisabled}
          onClick={() => setMotionOverride(!motionDisabled)}
          className="group inline-flex shrink-0 items-center gap-2 text-[10px] tracking-[0.12em] text-(--landing-muted) uppercase outline-offset-4 hover:text-(--landing-accent) focus-visible:text-(--landing-accent) sm:text-[11px]"
        >
          <span>Motion</span>
          <span
            aria-hidden="true"
            className="relative inline-flex h-3.5 w-7 items-center border border-(--landing-line) p-0.5"
          >
            {/* Knob sits right at full motion, slides left when reduced. */}
            <span className="block size-2 translate-x-3 bg-(--landing-accent) transition-transform duration-220 ease-(--ease-out-soft) group-aria-pressed:translate-x-0" />
          </span>
          <span>{motionDisabled ? "Reduced" : "Full"}</span>
        </button>
      </footer>

      {technicalVisible ? (
        <aside
          aria-label="Technical layer"
          className="absolute right-6 bottom-20 z-30 w-[min(360px,calc(100vw-3rem))] border border-(--landing-line) bg-(--landing-paper)/95 p-4 font-mono text-[10px] shadow-[0_18px_60px_rgba(37,42,38,0.12)] backdrop-blur-sm sm:right-9 sm:bottom-24"
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2">
            {technicalRows.map(([term, description]) => (
              <div key={term} className="contents">
                <dt className="text-(--landing-muted)">{term}</dt>
                <dd className="text-(--landing-ink)">{description}</dd>
              </div>
            ))}
          </dl>
        </aside>
      ) : null}
    </main>
  );
}
