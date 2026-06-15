"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useRef } from "react";
import {
  PageTransitionContext,
  type CoverOptions,
} from "@/lib/page-transition-context";
import { swallowViewTransitionAbort } from "@/lib/view-transition-coordinator";

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
    async ({ href, originEl }: CoverOptions) => {
      if (activeRef.current) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (!document.startViewTransition || reducedMotion) {
        router.push(href);
        return;
      }

      activeRef.current = true;

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
        router.push(href);
        await navCommitted;
      };

      const transition = document.startViewTransition(update);
      swallowViewTransitionAbort(transition);

      await transition.ready;

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

      try {
        await transition.finished;
      } finally {
        activeRef.current = false;
        resolveNavRef.current = null;
        _notifyTransitionComplete(prevPathRef.current);
      }
    },
    [router, _notifyTransitionComplete],
  );

  useEffect(() => _register(handleCover), [_register, handleCover]);

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
