"use client";

import { useMediaQuery } from "@/components/landing/use-media-query";
import { PageTransitionContext } from "@/lib/page-transition-context";
import { consumeRestorePending, setLenisInstance } from "@/lib/scroll-restore";
import gsap from "gsap";
import { ReactLenis, useLenis } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

export function scrollLerpForRoute(
  pathname: string,
  reducedMotion: boolean,
): number {
  return reducedMotion || pathname === "/home/photography" ? 1 : 0.1;
}

function TickerBridge() {
  const lenis = useLenis(ScrollTrigger.update);

  useEffect(() => {
    if (!lenis) return;
    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
    };
  }, [lenis]);

  return null;
}

function ScrollReset() {
  const lenis = useLenis();
  const { subscribeTransitionComplete } = useContext(PageTransitionContext);
  const lenisRef = useRef<ReturnType<typeof useLenis>>(null);

  useEffect(() => {
    lenisRef.current = lenis;
    setLenisInstance(lenis ?? null);
  }, [lenis]);

  useEffect(() => {
    return subscribeTransitionComplete(() => {
      // A back-navigation may have already restored scroll (so the reverse
      // morph lands on an on-screen card). Don't reset to top in that case.
      if (!consumeRestorePending()) {
        lenisRef.current?.scrollTo(0, { immediate: true });
      }
      requestAnimationFrame(() => {
        lenisRef.current?.resize();
        ScrollTrigger.refresh();
      });
    });
  }, [subscribeTransitionComplete]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const opts = useMemo(
    () => ({
      autoRaf: false,
      lerp: scrollLerpForRoute(pathname, reducedMotion),
      syncTouch: false,
    }),
    [pathname, reducedMotion],
  );

  return (
    <ReactLenis root options={opts}>
      <TickerBridge />
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}
