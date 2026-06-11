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
};

type PageTransitionContextValue = {
  /**
   * Trigger a covered page transition from any client component:
   *   const cover = usePageTransition();
   *   cover({ href: '/work', originEl: btnRef.current });
   */
  cover: (opts: CoverOptions) => void;
  /**
   * Internal — called once by PageTransitionOverlay to register itself.
   * Returns a cleanup function.
   */
  _register: (fn: (opts: CoverOptions) => void | Promise<void>) => () => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue>({
  cover: () => {},
  _register: () => () => {},
});

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<((opts: CoverOptions) => void) | null>(null);

  const cover = useCallback((opts: CoverOptions) => {
    handlerRef.current?.(opts);
  }, []);

  const _register = useCallback((fn: (opts: CoverOptions) => void | Promise<void>) => {
    handlerRef.current = fn;
    return () => {
      if (handlerRef.current === fn) handlerRef.current = null;
    };
  }, []);

  return (
    <PageTransitionContext.Provider value={{ cover, _register }}>
      {children}
    </PageTransitionContext.Provider>
  );
}

/** Call from any client component to trigger a page transition. */
export function usePageTransition() {
  return useContext(PageTransitionContext).cover;
}

export { PageTransitionContext };
