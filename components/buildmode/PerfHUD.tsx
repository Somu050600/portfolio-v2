"use client";

import { useEffect, useState } from "react";
import { onCLS, onINP, onLCP, type Metric } from "web-vitals";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type MemoryInfo = {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
};

function formatMs(n: number | null) {
  if (n == null) return "—";
  return `${Math.round(n)}ms`;
}

function formatCls(n: number | null) {
  if (n == null) return "—";
  return n.toFixed(3);
}

function formatMb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function PerfHUD() {
  const reducedMotion = useReducedMotion();
  const [fps, setFps] = useState(60);
  const [lcp, setLcp] = useState<number | null>(null);
  const [inp, setInp] = useState<number | null>(null);
  const [cls, setCls] = useState<number | null>(null);
  const [memory, setMemory] = useState<MemoryInfo | null>(null);

  useEffect(() => {
    const onMetric = (m: Metric) => {
      if (m.name === "LCP") setLcp(m.value);
      if (m.name === "INP") setInp(m.value);
      if (m.name === "CLS") setCls(m.value);
    };
    onLCP(onMetric);
    onINP(onMetric);
    onCLS(onMetric);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let acc = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      frames++;
      acc += now - last;
      last = now;
      if (acc >= 500) {
        setFps(Math.round((frames / acc) * 1000));
        frames = 0;
        acc = 0;

        const perf = performance as Performance & {
          memory?: MemoryInfo;
        };
        if (perf.memory) setMemory(perf.memory);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <aside
      className="fixed right-4 bottom-4 z-[9992] w-44 rounded-xl border border-border-color bg-elevated/95 p-3 font-mono text-[10px] text-ink-dim shadow-lg backdrop-blur-sm"
      aria-label="Performance HUD"
    >
      <p className="mb-2 tracking-[0.18em] text-ink-faint uppercase">
        Perf HUD
      </p>
      <dl className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1">
        <dt>FPS</dt>
        <dd className="text-right text-ink tabular-nums">{fps}</dd>
        <dt>LCP</dt>
        <dd className="text-right text-ink tabular-nums">{formatMs(lcp)}</dd>
        <dt>INP</dt>
        <dd className="text-right text-ink tabular-nums">{formatMs(inp)}</dd>
        <dt>CLS</dt>
        <dd className="text-right text-ink tabular-nums">{formatCls(cls)}</dd>
        {memory && (
          <>
            <dt>Heap</dt>
            <dd className="text-right text-ink tabular-nums">
              {formatMb(memory.usedJSHeapSize)}
            </dd>
          </>
        )}
      </dl>
      {reducedMotion && (
        <p className="mt-2 text-[9px] text-ink-faint">Reduced motion</p>
      )}
    </aside>
  );
}
