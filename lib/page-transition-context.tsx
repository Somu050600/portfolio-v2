"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";

export type CoverOptions = {
  /** Route to navigate to */
  href: string;
  /** Explicit motion override from a local control. Undefined uses the OS query. */
  reducedMotion?: boolean;
  /** Element the transition originates from (its center seeds the circle). */
  originEl?: HTMLElement | null;
  /**
   * Exact viewport point the circle reveal should grow from (e.g. a tap/click
   * position). Takes precedence over originEl — use it so the reveal blooms
   * from where the user actually pressed, not the element's center.
   */
  originPoint?: { x: number; y: number };
  /**
   * 'forward' (default): new page grows IN as a circle from origin.
   * 'backward': old page shrinks AWAY as a circle back to origin,
   *             revealing the new page underneath.
   */
  direction?: "forward" | "backward";
  /**
   * When true, skip the circle clip-path and run a shared-element morph
   * instead (elements tagged with view-transition-name interpolate). Used by
   * the card ↔ case-study transition; tagging is done by the caller.
   */
  morph?: boolean;
  /**
   * When true, run a directional vertical push between home sections instead
   * of the circle clip-path. Direction is derived from section order by the
   * handler. Used by the sidebar nav and ⌘K section jumps.
   */
  slide?: boolean;
  /**
   * When true, the new page descends from the top edge like a shade being
   * pulled down — no origin needed, so keyboard activation looks identical to
   * a click. Used by the landing header nav, which sits at that top edge; the
   * circle reveal stays exclusive to the EXPLORE CTA.
   */
  shade?: boolean;
};

type TransitionCompleteListener = (pathname: string) => void;

type PageTransitionContextValue = {
  cover: (opts: CoverOptions) => void;
  _register: (fn: (opts: CoverOptions) => void | Promise<void>) => () => void;
  /** Fires after the circle-reveal animation finishes (or on hard nav). */
  subscribeTransitionComplete: (
    listener: TransitionCompleteListener,
  ) => () => void;
  _notifyTransitionComplete: (pathname: string) => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue>({
  cover: () => {},
  _register: () => () => {},
  subscribeTransitionComplete: () => () => {},
  _notifyTransitionComplete: () => {},
});

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<((opts: CoverOptions) => void) | null>(null);
  const completeListenersRef = useRef(new Set<TransitionCompleteListener>());

  const cover = useCallback((opts: CoverOptions) => {
    handlerRef.current?.(opts);
  }, []);

  const _register = useCallback((fn: (opts: CoverOptions) => void | Promise<void>) => {
    handlerRef.current = fn;
    return () => {
      if (handlerRef.current === fn) handlerRef.current = null;
    };
  }, []);

  const subscribeTransitionComplete = useCallback(
    (listener: TransitionCompleteListener) => {
      completeListenersRef.current.add(listener);
      return () => {
        completeListenersRef.current.delete(listener);
      };
    },
    [],
  );

  const _notifyTransitionComplete = useCallback((pathname: string) => {
    completeListenersRef.current.forEach((fn) => fn(pathname));
  }, []);

  return (
    <PageTransitionContext.Provider
      value={{
        cover,
        _register,
        subscribeTransitionComplete,
        _notifyTransitionComplete,
      }}
    >
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  return useContext(PageTransitionContext).cover;
}

export { PageTransitionContext };
