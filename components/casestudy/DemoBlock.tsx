"use client";

import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import {
  caseStudyArtifact,
  caseStudyCaption,
  caseStudyCodeBody,
  caseStudyCodeHeader,
  caseStudyCodeNote,
  caseStudyCodeToggle,
  caseStudyDarkSurface,
} from "./case-study-classes";
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
    <figure
      className={cn(
        "not-prose",
        caseStudyDarkSurface,
        caseStudyArtifact,
      )}
    >
      <div className={caseStudyCodeHeader}>
        <span>{label}</span>
        <span>interactive</span>
      </div>

      {/* Demo stage — dotted grid on the base bg, so the component (its own
          elevated card) reads as sitting on a canvas, distinct from the frame. */}
      <div className="flex justify-center bg-thumb-bg bg-[radial-gradient(circle,var(--thumb-border)_1px,transparent_1px)] bg-size-[15px_15px] p-6">
        <Component />
      </div>

      {caption && (
        <figcaption
          className={cn(
            caseStudyCaption,
            "border-t border-thumb-border px-3.5 py-2.5 text-thumb-ink-faint",
          )}
        >
          {caption}
        </figcaption>
      )}

      {/* How it works — note + code, collapsed together (shadcn-style peek).
          Outer = positioning context (fade + button stay put); inner = the
          clamped/animated block that scrolls when expanded. */}
      <div className="relative border-t border-thumb-border">
        <div className={caseStudyCodeHeader}>
          <span>implementation.tsx</span>
          <span>{expanded ? "open" : "preview"}</span>
        </div>
        <div
          ref={divRef}
          data-lenis-prevent
          className="overflow-hidden"
          style={{ maxHeight: COLLAPSED }}
        >
          <p className={caseStudyCodeNote}>
            {how.note}
          </p>
          <pre className={caseStudyCodeBody}>
            <code className="whitespace-pre">
              {how.code}
            </code>
          </pre>
        </div>

        {/* fade mask — only while collapsed */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-20 transition-opacity duration-200",
            "bg-linear-to-t from-thumb-bg to-transparent",
            expanded && "opacity-0",
          )}
        />

        {/* floating toggle — lives in the outer wrapper so it never scrolls */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={caseStudyCodeToggle}
        >
          {expanded ? "Collapse ↑" : "Show code ↓"}
        </button>
      </div>
    </figure>
  );
}
