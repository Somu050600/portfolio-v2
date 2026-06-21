"use client";

import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

const COLLAPSED = 96; // 6rem peek
const EXPANDED_MAX = 384; // 24rem

/**
 * An expandable code block: a clamped peek with a gradient fade and a floating
 * toggle, expanding (GSAP height tween) to a scrollable max height. Shared by
 * DemoBlock and VTLab.
 */
export default function CodePeek({
  note,
  code,
}: {
  note?: string;
  code: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    const target = expanded
      ? Math.min(el.scrollHeight, EXPANDED_MAX)
      : COLLAPSED;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (firstRun.current || reduced) {
      firstRun.current = false;
      gsap.set(el, { maxHeight: target });
      el.style.overflowY = expanded ? "auto" : "hidden";
      return;
    }

    gsap.killTweensOf(el);
    el.style.overflowY = "hidden";
    gsap.to(el, {
      maxHeight: target,
      duration: expanded ? 0.4 : 0.3,
      ease: expanded ? "power2.out" : "power2.in",
      onComplete: () => {
        if (expanded) el.style.overflowY = "auto";
      },
    });
  }, [expanded]);

  return (
    <div className="relative border-t border-border-color">
      <div
        ref={divRef}
        data-lenis-prevent
        className="overflow-hidden px-4 py-4"
        style={{ maxHeight: COLLAPSED }}
      >
        {note && (
          <p className="mb-3 text-sm leading-relaxed text-ink-dim">{note}</p>
        )}
        <pre className="overflow-x-auto rounded-lg border border-border-color bg-bg p-3">
          <code className="font-mono text-[12px] leading-relaxed whitespace-pre text-ink-dim">
            {code}
          </code>
        </pre>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-surface to-transparent transition-opacity duration-200",
          expanded && "opacity-0",
        )}
      />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border-color bg-surface px-3 py-1 font-mono text-[11px] text-ink-dim shadow-sm transition-colors hover:border-ink-faint hover:text-accent"
      >
        {expanded ? "Collapse ↑" : "Show code ↓"}
      </button>
    </div>
  );
}
