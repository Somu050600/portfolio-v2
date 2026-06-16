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
  /** Element the transition originates from */
  originEl?: HTMLElement | null;
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
