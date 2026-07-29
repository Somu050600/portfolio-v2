"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useRef } from "react";
import {
  PageTransitionContext,
  type CoverOptions,
} from "@/lib/page-transition-context";
import { setMorphPending } from "@/lib/morph";
import { homeSectionIndex } from "@/lib/home.config";
// TEMPORARY — circle-origin bug instrumentation. Remove with lib/vt-debug.ts.
import {
  animationsSnapshot,
  applyVtGroupAnimFlag,
  browserSnapshot,
  isVtDebug,
  mountOriginMarker,
  forcePxClip,
  pseudoStyles,
  revealDuration,
  unmountOriginMarker,
  viewportSnapshot,
  vtReportFlush,
  vtReportStart,
  vtStage,
} from "@/lib/vt-debug";

/**
 * Handles all page transitions via the View Transitions API — same pattern as
 * the theme toggle slant-wipe, but with a circle growing from the click origin.
 *
 * How it works (mirrors the theme-toggle pattern exactly):
 *   1. startViewTransition(callback) → browser snapshots the OLD page.
 *   2. callback: calls router.push(), then waits for a Promise.
 *   3. usePathname() detects the new route is committed → resolves the Promise.
 *   4. browser snapshots the NEW page.
 *   5. transition.ready → we animate ::view-transition-new(root) with
 *      clip-path: circle(0% → full) so the new page's content grows in.
 *      Percentages are required, not cosmetic — see the note at the animate()
 *      call: px resolve against the snapshot's device pixels in Chrome.
 *
 * ::view-transition-new(root) IS the new page — the circle reveals real /home
 * content, not a blank disc.
 *
 * Fallback: no VT support or prefers-reduced-motion → plain router.push().
 */
export default function PageTransitionOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const { _register, _notifyTransitionComplete } = useContext(
    PageTransitionContext,
  );

  const prevPathRef = useRef(pathname);
  const resolveNavRef = useRef<(() => void) | null>(null);
  const activeRef = useRef(false);
  const initialNotifyRef = useRef(false);

  const handleCover = useCallback(
    async ({
      href,
      originEl,
      originPoint,
      morph,
      slide,
      shade,
      direction,
      reducedMotion: reducedMotionOverride,
    }: CoverOptions) => {
      if (activeRef.current) {
        setMorphPending(null);
        return;
      }

      // Only suppress Next's scroll-to-top on a back-navigation — there our
      // scroll-restore re-applies the saved position and Next's reset would
      // clobber it. Forward navs still scroll to top (e.g. a case study should
      // open at the top, and its morph must snapshot the hero at the top).
      const keepScroll = direction === "backward";

      const reducedMotion =
        reducedMotionOverride ??
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!document.startViewTransition || reducedMotion) {
        router.push(href, { scroll: !keepScroll });
        return;
      }

      activeRef.current = true;

      // Directional vertical push between home sections. Tag <html> so the
      // scoped CSS (app/globals.css) names the content pane and picks keyframes;
      // the name is applied only while sliding so it never disturbs the
      // circle-reveal (root) or cs-* morph transitions.
      const root = document.documentElement;
      let slideActive = false;
      if (slide) {
        const from = homeSectionIndex(prevPathRef.current);
        const to = homeSectionIndex(href);
        const dir = from === -1 || to === -1 || to >= from ? "up" : "down";
        // Both snapshots are clipped to one viewport from the element's top;
        // resetting scroll first keeps the old snapshot top-aligned like the new.
        window.scrollTo(0, 0);
        root.dataset.slideDir = dir;
        root.setAttribute("data-slide-active", "");
        slideActive = true;
      }

      const rect = originEl?.getBoundingClientRect();
      // Prefer the exact press point (originPoint), then the origin element's
      // center, then the viewport center.
      const ox =
        originPoint?.x ??
        (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
      const oy =
        originPoint?.y ??
        (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);
      // window.innerHeight is the *dynamic* viewport (shrinks while the mobile
      // address bar shows); the revealed page is min-h-screen (the *large*
      // viewport). Size the radius from the larger of the dynamic and layout
      // viewports so the circle always covers — no uncovered strip on mobile.
      const vw = Math.max(window.innerWidth, document.documentElement.clientWidth);
      const vh = Math.max(
        window.innerHeight,
        document.documentElement.clientHeight,
      );
      const maxR = Math.ceil(Math.hypot(vw, vh)) + 50;

      if (isVtDebug()) {
        applyVtGroupAnimFlag();
        vtReportStart({ href, morph, slide, direction });
        vtStage("1_coverStart_oldDocument", {
          originPoint,
          originRect: rect ? rect.toJSON() : null,
          resolved: { ox, oy },
          radius: { vw, vh, maxR },
          viewport: viewportSnapshot(),
        });
        void browserSnapshot().then((info) => vtStage("0_browser", info));
      }

      let resolveFn!: () => void;
      const navCommitted = new Promise<void>((res) => {
        resolveFn = res;
      });
      resolveNavRef.current = resolveFn;

      const update = async () => {
        // Back-nav keeps scroll (scroll-restore re-applies it); forward navs
        // scroll to top so the destination — and its morph snapshot — is at top.
        router.push(href, { scroll: !keepScroll });
        await navCommitted;
        // Must happen before the NEW snapshot is taken so the marker gets its
        // own group and stays visible during the animation.
        if (isVtDebug()) {
          mountOriginMarker(ox, oy);
          vtStage("2_navCommitted_newDocument_preSnapshot", {
            viewport: viewportSnapshot(),
          });
        }
      };

      // Morph navigations skip the circle reveal below; the cs-* shared-element
      // groups animate via their default group animation (timing tuned in
      // globals.css). Non-morph navigations get the circle clip-path.
      const transition = document.startViewTransition(update);

      await transition.ready;

      if (isVtDebug()) {
        vtStage("3_transitionReady_pseudoTree", {
          clipPathFrom: `circle(0px at ${ox}px ${oy}px)`,
          clipPathTo: `circle(${maxR}px at ${ox}px ${oy}px)`,
          viewport: viewportSnapshot(),
          pseudos: pseudoStyles(),
          animations: animationsSnapshot(),
        });
      }

      // The circle is expressed in PERCENTAGES, not px, and that is load-bearing:
      // Chrome (150, retina) resolves clip-path on ::view-transition-new(root)
      // against the snapshot texture's DEVICE-pixel size, so px land at 1/dpr of
      // where they belong — the reveal blooms up-left of the button instead of
      // from it. Other Chromium builds (Brave 150) resolve against the CSS box.
      // Percentages resolve against the reference box in either space, so the
      // origin is correct on both. Same reason the theme-toggle slant-wipe uses
      // % polygons.
      const cx = ((ox / vw) * 100).toFixed(3);
      const cy = ((oy / vh) * 100).toFixed(3);
      // circle() percentage radii resolve against hypot(w,h)/√2.
      const pctR = ((maxR / (Math.hypot(vw, vh) / Math.SQRT2)) * 100).toFixed(2);
      // DEBUG (vtPx=1) re-demos the broken px path — see lib/vt-debug.ts.
      const px = forcePxClip();
      const clipFrom = px
        ? `circle(0px at ${ox}px ${oy}px)`
        : `circle(0% at ${cx}% ${cy}%)`;
      const clipTo = px
        ? `circle(${maxR}px at ${ox}px ${oy}px)`
        : `circle(${pctR}% at ${cx}% ${cy}%)`;

      if (!morph && !slide) {
        const reveal = document.documentElement.animate(
          shade
            ? // Shade pull: the new page descends from the top edge. Percentages
              // for the same reason the circle uses them.
              { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"] }
            : { clipPath: [clipFrom, clipTo] },
          {
            // revealDuration() is a no-op unless localStorage vtSlow=1 (debug).
            // The shade runs shorter: it is utility navigation, not the CTA.
            duration: revealDuration(shade ? 700 : 1500),
            easing: shade
              ? "cubic-bezier(0.22, 1, 0.36, 1)"
              : "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );

        if (isVtDebug()) {
          vtStage("4_revealAnimationCreated", {
            clipMode: px ? "px (debug)" : "percent",
            clipFrom,
            clipTo,
            keyframes: (reveal.effect as KeyframeEffect | null)?.getKeyframes(),
            pseudoElement: (reveal.effect as KeyframeEffect | null)
              ?.pseudoElement,
            playState: reveal.playState,
          });
          // Half a beat into the animation, re-read the pseudo geometry — this
          // is what the clip-path circle is actually resolved against.
          window.setTimeout(
            () =>
              vtStage("5_midAnimationPseudoGeometry", {
                pseudos: pseudoStyles(),
                animations: animationsSnapshot(),
              }),
            300,
          );
        }
      }

      try {
        await transition.finished;
      } finally {
        if (isVtDebug()) {
          vtStage("6_transitionFinished", { viewport: viewportSnapshot() });
          unmountOriginMarker();
          void vtReportFlush();
        }
        activeRef.current = false;
        resolveNavRef.current = null;
        if (slideActive) {
          root.removeAttribute("data-slide-active");
          delete root.dataset.slideDir;
        }
        _notifyTransitionComplete(prevPathRef.current);
      }
    },
    [router, _notifyTransitionComplete],
  );

  useEffect(() => _register(handleCover), [_register, handleCover]);

  // Fire on initial mount for direct URL loads — no VT animation runs, so
  // subscribeTransitionComplete would never fire without this.
  useEffect(() => {
    if (initialNotifyRef.current || activeRef.current) return;
    initialNotifyRef.current = true;

    const rafId = requestAnimationFrame(() =>
      _notifyTransitionComplete(pathname),
    );

    return () => cancelAnimationFrame(rafId);
  }, [pathname, _notifyTransitionComplete]);

  // usePathname() changes when Next.js commits the new page to the DOM.
  // Resolving here hands the "new" snapshot timing back to startViewTransition.
  useEffect(() => {
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;
    resolveNavRef.current?.();
    resolveNavRef.current = null;

    // Hard nav / back-forward — no VT animation in flight.
    if (!activeRef.current) {
      requestAnimationFrame(() => {
        _notifyTransitionComplete(pathname);
      });
    }
  }, [pathname, _notifyTransitionComplete]);

  // No DOM needed — view transitions are a pure browser API.
  return null;
}
