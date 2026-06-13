"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatMetric,
  parseMetricValue,
  type ParsedMetric,
} from "@/lib/metric-parse";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

type CounterProps = {
  value: string;
  label: string;
  className?: string;
};

function animateCount(
  parsed: ParsedMetric,
  duration: number,
  onFrame: (n: number) => void,
): () => void {
  if (!parsed.animatable) {
    onFrame(parsed.target);
    return () => {};
  }

  let raf = 0;
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - t) ** 3;
    onFrame(parsed.target * eased);
    if (t < 1) raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

export default function Counter({ value, label, className }: CounterProps) {
  const parsed = parseMetricValue(value);
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // SSR renders final value; client hydrates matching final.
  const [current, setCurrent] = useState(parsed.target);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    if (reducedMotion || !parsed.animatable) return;

    const el = ref.current;
    if (!el) return;

    let stopAnim = () => {};

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || played) return;
        setPlayed(true);
        setCurrent(0);
        stopAnim = animateCount(parsed, 1200, setCurrent);
      },
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      stopAnim();
    };
  }, [parsed, reducedMotion, played]);

  const shown = parsed.animatable
    ? formatMetric(parsed, current)
    : parsed.display;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border-color bg-elevated px-3 py-2.5",
        className,
      )}
    >
      <p
        className="font-serif text-xl font-light text-ink tabular-nums"
        suppressHydrationWarning={parsed.animatable}
      >
        {shown}
      </p>
      <p className="mt-0.5 font-mono text-[10px] tracking-wide text-ink-faint uppercase">
        {label}
      </p>
      <noscript>
        <p>{parsed.display}</p>
      </noscript>
    </div>
  );
}
