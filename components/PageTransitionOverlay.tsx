"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useRef } from "react";
import {
  PageTransitionContext,
  type CoverOptions,
} from "@/lib/page-transition-context";
import { setMorphPending } from "@/lib/morph";
import { homeSectionIndex } from "@/lib/home.config";

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
 *      clip-path: circle(0px → full) so the new page's content grows in.
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

  const handleCover = useCallback(
    async ({ href, originEl, morph, slide, direction }: CoverOptions) => {
      if (activeRef.current) {
        setMorphPending(null);
        return;
      }

      // Only suppress Next's scroll-to-top on a back-navigation — there our
      // scroll-restore re-applies the saved position and Next's reset would
      // clobber it. Forward navs still scroll to top (e.g. a case study should
      // open at the top, and its morph must snapshot the hero at the top).
      const keepScroll = direction === "backward";

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

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
      const ox = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const oy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      const maxR =
        Math.ceil(Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2)) +
        50;

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
      };

      // Morph navigations skip the circle reveal below; the cs-* shared-element
      // groups animate via their default group animation (timing tuned in
      // globals.css). Non-morph navigations get the circle clip-path.
      const transition = document.startViewTransition(update);

      await transition.ready;

      if (!morph && !slide) {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${ox}px ${oy}px)`,
              `circle(${maxR}px at ${ox}px ${oy}px)`,
            ],
          },
          {
            duration: 1500,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      }

      try {
        await transition.finished;
      } finally {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!activeRef.current) {
      requestAnimationFrame(() => _notifyTransitionComplete(pathname));
    }
  }, []);

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
