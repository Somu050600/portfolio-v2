"use client";

import {
  installViewTransitionCoordinator,
  setPopstateBridge,
  swallowViewTransitionAbort,
} from "@/lib/view-transition-coordinator";
import { usePathname } from "next/navigation";
import { use, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type PendingTransition = {
  start: Promise<void>;
  finish: () => void;
  /** Pathname when popstate fired — suspend until `pathname` differs. */
  fromPath: string;
};

/**
 * Wraps browser back/forward (popstate) in `document.startViewTransition`.
 * React flushes popstate navigations synchronously for bfcache, so declarative
 * `<ViewTransition>` morphs do not run without this bridge.
 */
export default function BrowserNativeTransitions({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const bridgingRef = useRef(false);

  const [pending, setPending] = useState<PendingTransition | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    installViewTransitionCoordinator();
    if (!document.startViewTransition) return;

    const onPopState = () => {
      if (document.visibilityState === "hidden") return;
      if (bridgingRef.current) return;

      bridgingRef.current = true;
      const fromPath = pathnameRef.current;

      let finish!: () => void;
      let finished = false;
      const waitForCommit = new Promise<void>((resolve) => {
        finish = () => {
          if (finished) return;
          finished = true;
          bridgingRef.current = false;
          setPopstateBridge(null);
          setPending(null);
          resolve();
        };
      });

      let transition!: ViewTransition;
      const waitForStart = new Promise<void>((resolve) => {
        const native = document.startViewTransition.bind(document);
        transition = native(() => {
          resolve();
          return waitForCommit;
        });
        setPopstateBridge({ finish, transition });
        swallowViewTransitionAbort(transition);
      });

      setPending({ start: waitForStart, finish, fromPath });
    };

    window.addEventListener("popstate", onPopState, true);
    return () => window.removeEventListener("popstate", onPopState, true);
  }, []);

  if (pending && pending.fromPath !== pathname) {
    use(pending.start);
  }

  useLayoutEffect(() => {
    if (!pending || pending.fromPath === pathname) return;
    pending.finish();
  }, [pathname, pending]);

  return children;
}
