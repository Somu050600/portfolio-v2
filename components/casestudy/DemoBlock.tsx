"use client";

import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { demoRegistry } from "./demos/registry";

const COLLAPSED = 96; // 6rem peek
const EXPANDED_MAX = 384; // 24rem

export default function DemoBlock({
  id,
  caption,
}: {
  id: string;
  caption?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);
  const entry = demoRegistry[id];

  // Animate the whole How-it-works block between the collapsed peek and the
  // expanded height.
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
    el.style.overflowY = "hidden"; // hide scrollbar while animating
    gsap.to(el, {
      maxHeight: target,
      duration: expanded ? 0.4 : 0.3,
      ease: expanded ? "power2.out" : "power2.in",
      onComplete: () => {
        if (expanded) el.style.overflowY = "auto";
      },
    });
  }, [expanded]);

  if (!entry) return null;
  const { label, Component, how } = entry;

  return (
    <figure className="not-prose overflow-hidden rounded-xl border border-border-color bg-surface">
      <div className="border-b border-border-color px-4 py-2">
        <span className="font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
          {label}
        </span>
      </div>

      {/* Demo stage — dotted grid on the base bg, so the component (its own
          elevated card) reads as sitting on a canvas, distinct from the frame. */}
      <div
        className="flex justify-center bg-bg p-6"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border-color) 1px, transparent 1px)",
          backgroundSize: "15px 15px",
        }}
      >
        <Component />
      </div>

      {caption && (
        <figcaption className="border-t border-border-color px-4 py-3 font-mono text-[10px] tracking-wide text-ink-faint">
          {caption}
        </figcaption>
      )}

      {/* How it works — note + code, collapsed together (shadcn-style peek).
          Outer = positioning context (fade + button stay put); inner = the
          clamped/animated block that scrolls when expanded. */}
      <div className="relative border-t border-border-color">
        <div
          ref={divRef}
          data-lenis-prevent
          className="overflow-hidden px-4 py-4"
          style={{ maxHeight: COLLAPSED }}
        >
          <p className="mb-3 text-sm leading-relaxed text-ink-dim">
            {how.note}
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border-color bg-bg p-3">
            <code className="font-mono text-[12px] leading-relaxed whitespace-pre text-ink-dim">
              {how.code}
            </code>
          </pre>
        </div>

        {/* fade mask — only while collapsed */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-surface to-transparent transition-opacity duration-200",
            expanded && "opacity-0",
          )}
        />

        {/* floating toggle — lives in the outer wrapper so it never scrolls */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border-color bg-surface px-3 py-1 font-mono text-[11px] text-ink-dim shadow-sm transition-colors hover:border-ink-faint hover:text-accent"
        >
          {expanded ? "Collapse ↑" : "Show code ↓"}
        </button>
      </div>
    </figure>
  );
}
