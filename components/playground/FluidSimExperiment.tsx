"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { typeStyles } from "@/lib/typography";

const FluidSimFull = dynamic(() => import("@/sketches/fluid-sim-full"), {
  ssr: false,
});

export default function FluidSimExperiment() {
  const reducedMotion = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (reducedMotion) {
    return (
      <p className={`${typeStyles.bodySmall} text-ink-dim`}>
        Fluid sim is disabled when reduced motion is preferred.
      </p>
    );
  }

  return (
    <div className="relative -mx-6 flex min-h-[70vh] flex-col md:-mx-12 lg:-mx-16">
      <div className="relative min-h-[70vh] flex-1 overflow-hidden rounded-xl border border-border-color bg-[#0a0a0a]">
        <FluidSimFull
          active={active}
          paused={hidden || !active}
          className="h-full min-h-[70vh] w-full"
        />
      </div>
      <p className={`${typeStyles.metadata} mt-3 text-ink-faint`}>
        Drag to inject dye · visibility-paused when tab is hidden
      </p>
      <button
        type="button"
        onClick={() => setActive((v) => !v)}
        className="mt-2 self-start font-mono text-sm font-medium text-ink-dim underline-offset-2 hover:text-ink hover:underline"
      >
        {active ? "Pause simulation" : "Resume simulation"}
      </button>
    </div>
  );
}

export function PlaygroundBackLink() {
  return (
    <Link
      href="/home/playground"
      className="mb-8 inline-flex items-center gap-2 font-body text-sm font-medium text-ink-dim hover:text-ink"
    >
      <span aria-hidden>←</span> Playground
    </Link>
  );
}
