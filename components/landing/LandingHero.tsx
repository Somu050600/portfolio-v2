"use client";

import { homeNavItems } from "@/lib/home.config";
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
import ExploreCta from "./ExploreCta";
import FocusFrame from "./FocusFrame";
import SplitChars from "./SplitChars";
import {
  captureElementCenter,
  resolveFocusStatus,
  splitFinalWord,
} from "./landing-interactions";
import { useHeadlineMagnetics } from "./use-headline-magnetics";
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
  [
    "br",
    "Architecture & Scalability",
    "right-[9%] bottom-[17%] opacity-(--quadrant-4)",
  ],
] as const;

/**
 * Final word of the headline. DotGothic16 has no italic cut, so the <em>'s
 * inherited italic is dropped rather than synthesised as a slant; per-glyph
 * tightening for its monospace advance lives in globals.css.
 *
 * "Exposed" is seven glyphs under two ~27-character lines, so it is tracked
 * out rather than in, which keeps the optical weight the slot carries. The
 * negative right margin absorbs the trailing letter-space so the word stays
 * optically centred under the stack.
 */
const FINAL_WORD_CLASS =
  "landing-final-word font-accent-dot text-[0.92em] font-semibold tracking-[0.1em] -mr-[0.1em] not-italic";

/** [key to press, what it does]. See use-landing-easter-eggs.ts */
const easterEggHints = [
  ["⌥", "Technical"],
  ["F", "Lock focus"],
  ["develop", "Semantic"],
  ["dbl-click", "Temperature"],
] as const;

/**
 * Shared by every nav item: one string beats a copy per link.
 * Bracket ticks flick in either side on hover/focus, echoing the focus-frame
 * corners: each is a 4px-wide box with three borders, so it reads as [ and ].
 */
const navLinkClass = [
  "relative text-(--landing-ink) outline-none transition-colors duration-180",
  "hover:text-(--landing-accent) focus-visible:text-(--landing-accent)",
  // left tick
  "before:absolute before:top-1/2 before:-left-2.5 before:h-[1.35em] before:w-1",
  "before:-translate-x-1 before:-translate-y-1/2 before:border-y before:border-l before:border-(--landing-accent)",
  "before:opacity-0 before:transition-[opacity,transform] before:duration-180",
  "hover:before:translate-x-0 hover:before:opacity-100",
  "focus-visible:before:translate-x-0 focus-visible:before:opacity-100",
  // right tick
  "after:absolute after:top-1/2 after:-right-2.5 after:h-[1.35em] after:w-1",
  "after:translate-x-1 after:-translate-y-1/2 after:border-y after:border-r after:border-(--landing-accent)",
  "after:opacity-0 after:transition-[opacity,transform] after:duration-180",
  "hover:after:translate-x-0 hover:after:opacity-100",
  "focus-visible:after:translate-x-0 focus-visible:after:opacity-100",
].join(" ");

export default function LandingHero({ background }: LandingHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  const cover = usePageTransition();
  const systemReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [ctaActive, setCtaActive] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [returnedToCentre, setReturnedToCentre] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [hintsPaused, setHintsPaused] = useState(false);
  const motionDisabled = motionOverride ?? systemReducedMotion;
  const interactiveLine = hoveredLine;
  const {
    lockedLine,
    technicalVisible,
    semanticVisible,
    temperature,
    cycleTemperature,
  } = useLandingEasterEggs(interactiveLine);
  const displayedLine = lockedLine ?? interactiveLine;

  // Character-level repulsion runs only where a fine pointer can drive it.
  const pointerInteractive = finePointer && !motionDisabled;

  useHeadlineMagnetics({ headlineRef, enabled: pointerInteractive });

  useSpotlightTracking({
    rootRef,
    motionDisabled,
    activeLine: displayedLine,
    anchoredLine: lockedLine,
    ctaActive,
    transitioning,
  });

  useEffect(() => {
    // Both nav targets too: the transition holds the old frame until the route
    // commits, so an unprefetched route shows as a stall before the shade moves.
    router.prefetch(landingConfig.hero.ctaTarget);
    router.prefetch("/home/about");
  }, [router]);

  // Hints cycle one at a time. All four stay in the DOM so assistive tech reads
  // the full set; only the active one is visible. Reduced motion shows them all
  // inline instead, because rotating text is movement too.
  useEffect(() => {
    if (motionDisabled || hintsPaused) return;
    const id = window.setInterval(
      () => setHintIndex((index) => (index + 1) % easterEggHints.length),
      3800,
    );
    return () => window.clearInterval(id);
  }, [motionDisabled, hintsPaused]);

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

  /**
   * Header nav gets the shade pull, not the circle. The circle stays the CTA's
   * gesture. No origin needed, so Enter on a focused link looks like a click.
   */
  const onNavClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      // Let modified clicks (new tab, etc.) behave natively.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      setMobileNavOpen(false);
      cover({ href, shade: true, reducedMotion: motionDisabled });
    },
    [cover, motionDisabled],
  );

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
          className={`pointer-events-none absolute z-4 font-mono text-metadata tracking-[0.16em] text-(--landing-muted) transition-opacity duration-80 ease-linear max-[519px]:hidden ${placement}`}
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
          onClick={(event) => onNavClick(event, "/home")}
          className="font-mono text-base font-medium tracking-[0.3em] text-(--landing-ink) uppercase outline-offset-6 transition-colors hover:text-(--landing-accent) focus-visible:outline-1 focus-visible:outline-(--landing-accent)"
        >
          SOMU
        </Link>

        {/* Same five sections, same order as the /home rail. The splash is the
            front door, so it can't hide two of them. */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-5 font-mono text-[15px] font-medium tracking-[0.02em] md:flex lg:gap-8"
          data-semantic-label="<nav>"
        >
          {homeNavItems.map((item) => (
            <Link
              key={item.key}
              className={navLinkClass}
              href={item.href}
              onClick={(event) => onNavClick(event, item.href)}
            >
              {item.label}
            </Link>
          ))}
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
          data-landing-mobile-nav
          aria-hidden={!mobileNavOpen}
          className="invisible pointer-events-none absolute top-18 right-6 flex min-w-48 -translate-y-1.5 flex-col gap-[0.9rem] border border-(--landing-line) bg-[color-mix(in_srgb,var(--landing-paper)_94%,transparent)] p-5 font-mono text-xs tracking-[0.08em] text-(--landing-ink) opacity-0 shadow-[0_18px_50px_rgba(37,42,38,0.1)] backdrop-blur-md transition-[opacity,transform,visibility] duration-180 data-open:visible data-open:pointer-events-auto data-open:translate-y-0 data-open:opacity-100 md:hidden"
          data-open={mobileNavOpen ? "" : undefined}
        >
          {homeNavItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={(event) => onNavClick(event, item.href)}
              className="outline-offset-4 hover:text-(--landing-accent) focus-visible:text-(--landing-accent)"
            >
              <span className="mr-2 text-(--landing-muted)">
                {item.ordinal}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <section
        aria-labelledby="landing-headline"
        className="relative z-10 flex min-h-svh items-center px-6 py-28 sm:px-10 lg:px-16"
      >
        <div className="mx-auto w-full max-w-280 text-center">
          <h1
            ref={headlineRef}
            id="landing-headline"
            // Every character span is aria-hidden, so the heading carries the
            // text itself, which is also what names the section via
            // aria-labelledby.
            aria-label={headline.join(" ")}
            // Inspectable gate state: absent means the magnet is switched off
            // (coarse pointer, no hover, or reduced motion).
            data-magnetic={pointerInteractive ? "" : undefined}
            // Three-layer depth: hairline for definition, soft mid, broad low
            // opacity. All drawn from --landing-ink so it follows temperature.
            // Sized for the longest line (~27 characters). The previous step
            // was set for a 21-character line and crowds the viewport here.
            className="font-landing cursor-default text-balance text-[clamp(2.1rem,4.9vw,5.3rem)] leading-[1.16] font-normal tracking-[-0.015em] [text-shadow:0_1px_0_color-mix(in_oklab,var(--landing-ink)_12%,transparent),0_2px_6px_color-mix(in_oklab,var(--landing-ink)_10%,transparent),0_10px_30px_color-mix(in_oklab,var(--landing-ink)_8%,transparent)] max-md:text-nowrap max-md:text-[clamp(1rem,6vw,2.4rem)]"
            data-active-line={displayedLine ?? undefined}
            data-semantic-label="<h1>"
          >
            {headline.map((line, index) => {
              const lineNumber = index + 1;
              const isFinalLine = index === headline.length - 1;
              const finalLineParts = isFinalLine ? splitFinalWord(line) : null;

              return (
                // No per-line hover, focus or dim treatment: the character field
                // is the only headline interaction. Pointer enter/leave stays
                // because the spotlight, status readout and F-lock read it.
                <span
                  key={line}
                  className="mx-auto block w-fit"
                  data-headline-line={lineNumber}
                  onPointerEnter={() => setHoveredLine(lineNumber)}
                  onPointerLeave={() => setHoveredLine(null)}
                >
                  {finalLineParts ? (
                    <>
                      {finalLineParts.leadingText ? (
                        <>
                          <SplitChars text={finalLineParts.leadingText} />{" "}
                        </>
                      ) : null}
                      <em className={FINAL_WORD_CLASS}>
                        <SplitChars
                          text={finalLineParts.finalWord}
                          variant="accent"
                        />
                      </em>
                    </>
                  ) : (
                    <SplitChars text={line} />
                  )}
                </span>
              );
            })}
          </h1>

          <div className="mt-8 flex flex-col items-center gap-3 font-mono sm:mt-10">
            <p className="text-xs tracking-[0.14em] text-(--landing-muted) uppercase sm:text-sm">
              {profile.name} · {landingConfig.hero.role}
            </p>
            <p className="text-metadata tracking-[0.08em] text-(--landing-muted) sm:text-xs">
              {landingConfig.hero.specialties}
            </p>
            <ExploreCta
              label={landingConfig.hero.ctaLabel}
              buttonRef={ctaRef}
              interactive={pointerInteractive}
              onActivate={activateExplore}
              onActiveChange={(active) => {
                // Stay lit through the transition once it has started.
                if (active || !transitioning) setCtaActive(active);
              }}
            />
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
          className="max-w-[58vw] text-metadata tracking-[0.16em] text-(--landing-muted) uppercase"
        >
          {focusStatus}
        </p>

        {/* The four easter eggs are otherwise undiscoverable. This is the only
            on-page pointer to them. One at a time, looping; hover to hold. */}
        <ul
          aria-label="Hidden interactions"
          onPointerEnter={() => setHintsPaused(true)}
          onPointerLeave={() => setHintsPaused(false)}
          // Absolutely centred in the footer rather than sitting in the flex
          // flow: as a flex child, justify-between re-distributed it every time
          // the status text or the Motion label changed width.
          className={`absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-metadata tracking-[0.14em] text-(--landing-muted) uppercase sm:bottom-8 ${
            motionDisabled
              ? "lg:flex lg:items-center lg:gap-4"
              : "h-4 w-56 lg:block"
          }`}
        >
          {easterEggHints.map(([key, label], index) => (
            <li
              key={label}
              className={`flex items-center gap-1.5 ${
                motionDisabled
                  ? ""
                  : `absolute inset-0 justify-center transition-[opacity,transform] duration-500 ease-(--ease-out-soft) ${
                      index === hintIndex
                        ? "translate-y-0 opacity-100"
                        : "translate-y-1 opacity-0"
                    }`
              }`}
            >
              <kbd className="border border-(--landing-line) px-1.5 py-0.5 font-mono text-(--landing-accent) not-italic">
                {key}
              </kbd>
              {label}
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-pressed={motionDisabled}
          // "Motion · Full" alone does not say what pressing it does.
          aria-label="Reduce motion on this page"
          onClick={() => setMotionOverride(!motionDisabled)}
          className="group inline-flex shrink-0 items-center gap-2 text-metadata tracking-[0.12em] text-(--landing-muted) uppercase outline-offset-4 hover:text-(--landing-accent) focus-visible:text-(--landing-accent)"
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
          className="absolute right-6 bottom-20 z-30 w-[min(360px,calc(100vw-3rem))] border border-(--landing-line) bg-(--landing-paper)/95 p-4 font-mono text-metadata shadow-[0_18px_60px_rgba(37,42,38,0.12)] backdrop-blur-sm sm:right-9 sm:bottom-24"
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
