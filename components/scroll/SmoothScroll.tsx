"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PageTransitionContext } from "@/lib/page-transition-context";

gsap.registerPlugin(ScrollTrigger);

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
  }, [lenis]);

  useEffect(() => {
    return subscribeTransitionComplete(() => {
      lenisRef.current?.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }, [subscribeTransitionComplete]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState({
    autoRaf: false,
    lerp: 0.1,
    syncTouch: false,
  });

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = requestAnimationFrame(() => {
      setOpts((o) => ({ ...o, lerp: 1 }));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <ReactLenis root options={opts}>
      <TickerBridge />
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}
